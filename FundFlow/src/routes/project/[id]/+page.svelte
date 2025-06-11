<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let project: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    goal_amount: number;
    current_amount: number;
  };

  let amount = '';
  let phone = '';
  let isLoading = false;
  let donationSuccess = false;

  onMount(async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', $page.params.id)
      .single();
    
    if (data) project = data;
  });

  async function handleDonate() {
    isLoading = true;
    
    // In a real app, you would call your M-Pesa API here
    // For now, we'll simulate a donation
    
    // Create donation record
    const { data, error } = await supabase
      .from('donations')
      .insert([{
        project_id: project.id,
        amount: parseFloat(amount),
        phone_number: phone,
        status: 'completed'
      }]);
    
    if (!error) {
      // Update project amount
      await supabase
        .from('projects')
        .update({ current_amount: project.current_amount + parseFloat(amount) })
        .eq('id', project.id);
      
      donationSuccess = true;
    }
    
    isLoading = false;
  }
</script>

{#if !project}
  <p>Loading project...</p>
{:else}
  <div class="max-w-4xl mx-auto">
    <div class="card lg:card-side bg-base-100 shadow-xl">
      <figure class="lg:w-1/2">
        <img src={project.image_url} alt={project.title} class="w-full h-full object-cover" />
      </figure>
      <div class="card-body lg:w-1/2">
        <h1 class="card-title text-3xl">{project.title}</h1>
        <p>{project.description}</p>
        
        <div class="w-full bg-gray-200 rounded-full h-4 mt-4">
          <div 
            class="bg-blue-600 h-4 rounded-full" 
            style={`width: ${Math.min(100, (project.current_amount / project.goal_amount) * 100)}%`}
          ></div>
        </div>
        <p class="text-sm">
          Ksh {project.current_amount.toLocaleString()} raised of Ksh {project.goal_amount.toLocaleString()}
        </p>
        
        {#if !donationSuccess}
          <div class="mt-8">
            <h2 class="text-xl font-semibold mb-4">Make a Donation</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">Amount (Ksh)</label>
                <input 
                  type="number" 
                  bind:value={amount}
                  class="input input-bordered w-full" 
                  placeholder="1000" 
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">M-Pesa Phone Number</label>
                <input 
                  type="tel" 
                  bind:value={phone}
                  class="input input-bordered w-full" 
                  placeholder="07XXXXXXXX" 
                />
              </div>
              <button 
                on:click={handleDonate}
                disabled={isLoading}
                class="btn btn-primary w-full"
              >
                {isLoading ? 'Processing...' : 'Donate Now'}
              </button>
            </div>
          </div>
        {:else}
          <div class="alert alert-success mt-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Thank you for your donation! Your contribution is making a difference.</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}