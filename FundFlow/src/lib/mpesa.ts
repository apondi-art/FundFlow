// src/lib/mpesa.js
import { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, MPESA_SHORTCODE } from '$env/static/private';

// M-Pesa API URLs
export const MPESA_BASE_URL = 'https://sandbox.safaricom.co.ke'; // Use sandbox for testing
// For production: 'https://api.safaricom.co.ke'
import { Buffer } from 'buffer';

export async function getMpesaToken() {
    // Validate environment variables
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
        throw new Error('M-Pesa credentials not configured in environment variables');
    }

    // Trim whitespace from credentials
    const consumerKey = MPESA_CONSUMER_KEY.trim();
    const consumerSecret = MPESA_CONSUMER_SECRET.trim();
    
    // Create auth string and encode
    const authString = `${consumerKey}:${consumerSecret}`;
    const auth = Buffer.from(authString).toString('base64');

    try {
        const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        // Get raw response text for debugging
        const responseText = await response.text();
        
        if (!response.ok) {
            console.error('M-Pesa API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                body: responseText
            });
            throw new Error(`HTTP ${response.status}: ${responseText || 'No error details'}`);
        }

        try {
            const data = JSON.parse(responseText);
            if (!data.access_token) {
                throw new Error('Access token missing in response');
            }
            return data.access_token;
        } catch (parseError) {
            console.error('Failed to parse M-Pesa response:', {
                responseText,
                error: parseError.message
            });
            throw new Error('Invalid JSON response from M-Pesa API');
        }
    } catch (error) {
        console.error('Complete M-Pesa Authentication Failure:', {
            timestamp: new Date().toISOString(),
            credentials: {
                key: consumerKey,
                secret: '***' + consumerSecret.slice(-4), // Log partial secret
                authString,
                base64Auth: auth
            },
            error: error.message
        });
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
export function formatPhoneNumber(phone) {
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