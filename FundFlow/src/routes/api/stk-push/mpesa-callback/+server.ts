// src/routes/api/mpesa-callback/+server.js
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabase.js';

export async function POST({ request }) {
    try {
        const callbackData = await request.json();
        console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

        // Extract the callback data
        const { Body } = callbackData;
        const { stkCallback } = Body;
        
        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;

        // Find the donation record
        const { data: donation, error: findError } = await supabase
            .from('donations')
            .select('*, projects(*)')
            .eq('checkout_request_id', checkoutRequestId)
            .single();

        if (findError || !donation) {
            console.error('Donation not found:', findError);
            // Still return success to M-Pesa
            return json({ ResultCode: 0, ResultDesc: "Callback received" });
        }

        if (resultCode === 0) {
            // Payment successful
            let mpesaReceiptNumber = '';
            let transactionDate = '';

            // Extract receipt number and date from callback items
            if (stkCallback.CallbackMetadata && stkCallback.CallbackMetadata.Item) {
                const items = stkCallback.CallbackMetadata.Item;
                
                items.forEach(item => {
                    if (item.Name === 'MpesaReceiptNumber') {
                        mpesaReceiptNumber = item.Value;
                    }
                    if (item.Name === 'TransactionDate') {
                        transactionDate = item.Value;
                    }
                });
            }

            // Update donation record to completed
            const { error: updateDonationError } = await supabase
                .from('donations')
                .update({
                    status: 'completed',
                    mpesa_receipt_number: mpesaReceiptNumber,
                    transaction_date: transactionDate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', donation.id);

            if (updateDonationError) {
                console.error('Error updating donation:', updateDonationError);
            } else {
                // Update project current amount
                const newCurrentAmount = donation.projects.current_amount + donation.amount;
                
                const { error: updateProjectError } = await supabase
                    .from('projects')
                    .update({ current_amount: newCurrentAmount })
                    .eq('id', donation.project_id);

                if (updateProjectError) {
                    console.error('Error updating project amount:', updateProjectError);
                }
            }

        } else {
            // Payment failed
            const { error: updateError } = await supabase
                .from('donations')
                .update({ 
                    status: 'failed',
                    failure_reason: resultDesc,
                    updated_at: new Date().toISOString()
                })
                .eq('id', donation.id);

            if (updateError) {
                console.error('Error updating failed donation:', updateError);
            }
        }

        // Always return success response to M-Pesa
        return json({
            ResultCode: 0,
            ResultDesc: "Callback processed successfully"
        });

    } catch (error) {
        console.error('Callback processing error:', error);
        
        // Still return success to M-Pesa to avoid retries
        return json({
            ResultCode: 0,
            ResultDesc: "Callback received"
        });
    }
}