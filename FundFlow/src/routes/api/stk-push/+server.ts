// src/routes/api/stk-push/+server.js
import { json } from '@sveltejs/kit';
import { getMpesaToken, generatePassword, formatPhoneNumber, MPESA_BASE_URL } from '$lib/mpesa.js';
import { MPESA_SHORTCODE } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { supabase } from '$lib/supabase.js';

export async function POST({ request }) {
    try {
        const { amount, phone, projectId } = await request.json();
        
        // Validate input
        if (!amount || !phone || !projectId) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Format phone number
        const formattedPhone = formatPhoneNumber(phone);
        
        // Generate password and timestamp
        const { password, timestamp } = generatePassword();
        
        // Get M-Pesa access token
        const accessToken = await getMpesaToken();
        
        // Create a pending donation record first
        const { data: donation, error: dbError } = await supabase
            .from('donations')
            .insert([{
                project_id: projectId,
                amount: parseFloat(amount),
                phone_number: formattedPhone,
                status: 'pending'
            }])
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            return json({ error: 'Failed to create donation record' }, { status: 500 });
        }

        // Prepare STK Push request
        const stkPushData = {
            BusinessShortCode: MPESA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: parseInt(amount),
            PartyA: formattedPhone,
            PartyB: MPESA_SHORTCODE,
            PhoneNumber: formattedPhone,
            CallBackURL: `${PUBLIC_APP_URL}/api/mpesa-callback`,
            AccountReference: `Donation-${donation.id}`,
            TransactionDesc: `Donation for project ${projectId}`
        };

        // Make STK Push request
        const stkResponse = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stkPushData)
        });

        const stkData = await stkResponse.json();
        console.log('STK Push Response:', stkData);
        
        if (stkData.ResponseCode === '0') {
            // Update donation record with checkout request ID
            await supabase
                .from('donations')
                .update({ 
                    checkout_request_id: stkData.CheckoutRequestID,
                    merchant_request_id: stkData.MerchantRequestID
                })
                .eq('id', donation.id);

            return json({
                success: true,
                message: 'STK Push sent successfully',
                checkoutRequestId: stkData.CheckoutRequestID,
                donationId: donation.id
            });
        } else {
            // Update donation status to failed
            await supabase
                .from('donations')
                .update({ status: 'failed' })
                .eq('id', donation.id);

            return json({
                success: false,
                error: stkData.ResponseDescription || 'STK Push failed'
            }, { status: 400 });
        }

    } catch (error) {
        console.error('STK Push error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}