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
    console.log('Supabase client:', supabase);
    
    const { data: tableData, error: tableError } = await supabase
      .from('projects')
      .select('count(*)', { count: 'exact', head: true });
    
    console.log('Table count result:', { tableData, tableError });
    
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getProgressPercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
}
</script>

<div class="app-container">
  <div class="content-wrapper">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1 class="hero-title">Support Social Projects</h1>
      <p class="hero-subtitle">
        Contribute to meaningful causes.
         Every donation makes a difference.
      </p>
    </div>

    {#if isLoading}
      <div class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Loading projects...</p>
      </div>
    {:else if error}
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button on:click={() => window.location.reload()} class="retry-button">
          Try Again
        </button>
      </div>
    {:else if projects.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>No Projects Available</h3>
        <p>We couldn't find any active projects at the moment. Please check back later.</p>
        <button on:click={() => window.location.reload()} class="refresh-button">
          Refresh
        </button>
      </div>
    {:else}
      <!-- Project Grid -->
      <div class="projects-grid">
        {#each projects as project}
          <div class="project-card">
            <!-- Image -->
            <div class="project-image-container">
              <img
                src={project.imageUrl}
                alt={project.title}
                class="project-image"
                on:error={handleImageError}
              />
              <div class="funding-badge">
                {Math.round(getProgressPercentage(project.currentAmount, project.goalAmount))}% funded
              </div>
            </div>

            <!-- Content -->
            <div class="project-content">
              <h2 class="project-title">{project.title}</h2>
              <p class="project-description">{project.description}</p>

              <!-- Progress section -->
              <div class="progress-section">
                <div class="progress-stats">
                  <span class="raised-amount">Raised: {formatCurrency(project.currentAmount)}</span>
                  <span class="goal-amount">Goal: {formatCurrency(project.goalAmount)}</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    style={`width: ${getProgressPercentage(project.currentAmount, project.goalAmount)}%`}
                  ></div>
                </div>
              </div>

              <!-- Action button -->
              <a href={`/project/${project.id}`} class="donate-button">
                <span class="donate-icon">💖</span>
                Donate
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
