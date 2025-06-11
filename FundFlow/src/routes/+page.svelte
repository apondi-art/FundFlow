<script lang="ts">
import { supabase } from '$lib/supabase';
import { onMount } from 'svelte';

let projects: Array<{
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  imageUrl: string;
}> = [];
let isLoading = true;
let error = '';

onMount(async () => {
  try {
    // First, let's check if we can connect to Supabase at all
    console.log('Supabase client:', supabase);
    
    // Try to get table info first
    const { data: tableData, error: tableError } = await supabase
      .from('projects')
      .select('count(*)', { count: 'exact', head: true });
    
    console.log('Table count result:', { tableData, tableError });
    
    // Now try to get the actual data
    const { data, error: supabaseError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Query result:', { data, error: supabaseError });

    if (supabaseError) {
      console.error('Supabase error details:', supabaseError);
      throw supabaseError;
    }

    console.log('Raw data from Supabase:', data);
    console.log('Data length:', data?.length);

    // Let's also try without ordering to see if that's the issue
    const { data: dataWithoutOrder, error: errorWithoutOrder } = await supabase
      .from('projects')
      .select('*');
    
    console.log('Data without ordering:', { dataWithoutOrder, errorWithoutOrder });

    projects = (data || []).map((item) => ({
      id: item.id,
      title: item.title || 'Untitled Project',
      description: item.description || 'No description available',
      goalAmount: item.goal_amount || 0,
      currentAmount: item.current_amount || 0,
      imageUrl: item.image_url || 'https://placehold.co/400x300/f3f4f6/6b7280?text=No+Image',
    }));

    console.log('Processed projects:', projects);
  } catch (err) {
    error = 'Failed to load projects. Please try again later.';
    console.error('Error fetching projects:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
  } finally {
    isLoading = false;
  }
});

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = 'https://placehold.co/400x300/f3f4f6/6b7280?text=Image+Not+Available';
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper function to calculate percentage
function getProgressPercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
}
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-center mb-8">Support Social Projects Anonymously</h1>
  
  {#if isLoading}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {:else if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
      {error}
    </div>
  {:else if projects.length === 0}
    <div class="text-center text-gray-500 py-8">
      No projects found. Please check back later.
      <br>
      <small class="text-xs">Check browser console for debugging info.</small>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each projects as project}
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <img
            src={project.imageUrl}
            alt={project.title}
            class="w-full h-48 object-cover"
            on:error={handleImageError}
          />
          <div class="p-4">
            <h2 class="text-xl font-semibold mb-2 line-clamp-2">{project.title}</h2>
            <p class="text-gray-600 mb-4 text-sm line-clamp-3">{project.description}</p>
            
            <div class="mb-4">
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  class="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={`width: ${getProgressPercentage(project.currentAmount, project.goalAmount)}%`}
                ></div>
              </div>
              <div class="flex justify-between mt-2 text-sm text-gray-600">
                <span class="font-medium">Raised: {formatCurrency(project.currentAmount)}</span>
                <span>Goal: {formatCurrency(project.goalAmount)}</span>
              </div>
              <div class="text-center mt-1 text-xs text-gray-500">
                {getProgressPercentage(project.currentAmount, project.goalAmount).toFixed(1)}% funded
              </div>
            </div>
            
            <a
              href={`/project/${project.id}`}
              class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md transition-colors duration-200 font-medium"
            >
              Donate Now
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

