<script lang="ts">
import { supabase } from '$lib/supabase';
import { onMount } from 'svelte';
import { page } from '$app/stores';

type Project = {
	id: number;
	title: string;
	description: string;
	goal_amount: number;
	current_amount: number;
	image_url: string;
	created_at?: string;
};

let project: Project | null = null;
let amount = '';
let phone = '';
let isLoading = false;
let donationSuccess = false;
let errorMessage = '';
let currentStep = 'form'; // 'form', 'processing', 'success', 'error'

onMount(async () => {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', $page.params.id)
        .single();
    
    if (data) {
        project = data;
    } else {
        console.error('Error loading project:', error);
    }
});

async function handleDonate() {
    // Reset states
    errorMessage = '';
    isLoading = true;
    currentStep = 'processing';

    // Check if project is loaded
    if (!project) {
        errorMessage = 'Project not loaded. Please try again later.';
        currentStep = 'error';
        isLoading = false;
        return;
    }

    // Basic validation
    if (!amount || parseFloat(amount) < 1) {
        errorMessage = 'Please enter a valid amount (minimum Ksh 1)';
        currentStep = 'error';
        isLoading = false;
        return;
    }

    if (!phone || phone.length < 10) {
        errorMessage = 'Please enter a valid phone number';
        currentStep = 'error';
        isLoading = false;
        return;
    }

    try {
        const response = await fetch('/api/stk-push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                phone: phone,
                projectId: project.id // ✅ Safe now
            })
        });

        const result = await response.json();

        if (result.success) {
            currentStep = 'success';
            donationSuccess = true;
        } else {
            currentStep = 'error';
            errorMessage = result.error || 'Payment failed. Please try again.';
        }
    } catch (error) {
        console.error('Donation error:', error);
        currentStep = 'error';
        errorMessage = 'Network error. Please check your connection and try again.';
    } finally {
        isLoading = false;
    }
}


function resetForm() {
    currentStep = 'form';
    donationSuccess = false;
    errorMessage = '';
    amount = '';
    phone = '';
}
</script>

<div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
        {#if !project}
            <div class="flex justify-center items-center h-64">
                <div class="loading loading-spinner loading-lg"></div>
                <span class="ml-4">Loading project...</span>
            </div>
        {:else}
            <div class="max-w-4xl mx-auto">
                <!-- Project Information -->
                <div class="card lg:card-side bg-white shadow-xl mb-8">
                    <figure class="lg:w-1/2">
                        <img 
                            src={project.image_url} 
                            alt={project.title} 
                            class="w-full h-full object-cover"
                        />
                    </figure>
                    <div class="card-body lg:w-1/2">
                        <h1 class="card-title text-3xl text-gray-800">{project.title}</h1>
                        <p class="text-gray-600">{project.description}</p>
                        
                        <!-- Progress Bar -->
                        <div class="mt-6">
                            <div class="flex justify-between text-sm mb-2">
                                <span>Progress</span>
                                <span>{Math.min(100, Math.round((project.current_amount / project.goal_amount) * 100))}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    class="bg-green-600 h-4 rounded-full transition-all duration-300"
                                    style="width: {Math.min(100, (project.current_amount / project.goal_amount) * 100)}%"
                                ></div>
                            </div>
                            <div class="flex justify-between text-sm mt-2">
                                <span class="font-semibold">Ksh {project.current_amount.toLocaleString()}</span>
                                <span>of Ksh {project.goal_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Donation Section -->
                <div class="card bg-white shadow-xl">
                    <div class="card-body">
                        {#if currentStep === 'form'}
                            <h2 class="card-title text-2xl mb-6">Make a Donation</h2>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label class="label">
                                        <span class="label-text font-medium">Amount (Ksh)</span>
                                    </label>
                                    <input
                                        type="number"
                                        bind:value={amount}
                                        class="input input-bordered w-full"
                                        placeholder="e.g., 1000"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label class="label">
                                        <span class="label-text font-medium">M-Pesa Phone Number</span>
                                    </label>
                                    <input
                                        type="tel"
                                        bind:value={phone}
                                        class="input input-bordered w-full"
                                        placeholder="0712345678"
                                    />
                                    <label class="label">
                                        <span class="label-text-alt">You'll receive an STK push on this number</span>
                                    </label>
                                </div>
                            </div>
                            <div class="card-actions justify-end mt-6">
                                <button
                                    on:click={handleDonate}
                                    disabled={isLoading}
                                    class="btn btn-primary btn-lg"
                                >
                                    {isLoading ? 'Processing...' : 'Donate via M-Pesa'}
                                </button>
                            </div>
                        {/if}

                        {#if currentStep === 'processing'}
                            <div class="text-center py-8">
                                <div class="loading loading-spinner loading-lg mb-4"></div>
                                <h3 class="text-xl font-semibold mb-2">Processing your donation...</h3>
                                <p class="text-gray-600">Please check your phone for the M-Pesa STK push prompt</p>
                                <p class="text-sm text-gray-500 mt-2">Complete the transaction on your phone to finish the donation</p>
                            </div>
                        {/if}

                        {#if currentStep === 'success'}
                            <div class="text-center py-8">
                                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold text-green-600 mb-2">STK Push Sent!</h3>
                                <p class="text-gray-600 mb-4">Please complete the payment on your phone</p>
                                <p class="text-sm text-gray-500 mb-6">
                                    Your donation will be processed once you enter your M-Pesa PIN and confirm the transaction.
                                </p>
                                <button on:click={resetForm} class="btn btn-outline">
                                    Make Another Donation
                                </button>
                            </div>
                        {/if}

                        {#if currentStep === 'error'}
                            <div class="text-center py-8">
                                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-semibold text-red-600 mb-2">Payment Error</h3>
                                <p class="text-gray-600 mb-6">{errorMessage}</p>
                                <div class="space-x-4">
                                    <button on:click={resetForm} class="btn btn-primary">
                                        Try Again
                                    </button>
                                    <button on:click={() => window.history.back()} class="btn btn-outline">
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>