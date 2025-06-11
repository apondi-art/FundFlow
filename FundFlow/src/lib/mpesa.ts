// src/lib/mpesa.js
import { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE } from '$env/static/private';

// M-Pesa API URLs
export const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke'; // Use sandbox for testing
// For production: 'https://api.safaricom.co.ke'

// Function to get M-Pesa access token
export async function getMpesaToken() {
    try {
        const auth = btoa(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);
        
        const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting M-Pesa token:', error);
        throw error;
    }
}

// Function to generate password for STK Push
export function generatePassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = btoa(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);
    return { password, timestamp };
}

// Function to format phone number for M-Pesa
export function formatPhoneNumber(phone: string): string {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phone.replace(/[\s\-\+]/g, '');
    
    // If it starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.slice(1);
    }
    
    // If it doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
        cleaned = '254' + cleaned;
    }
    
    return cleaned;
}
