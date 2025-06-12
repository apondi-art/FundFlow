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
      <h1 class="hero-title">Support Social Projects Anonymously</h1>
      <p class="hero-subtitle">
        Contribute to meaningful causes without revealing your identity. Every donation makes a difference.
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
                Donate Anonymously
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  /* Reset and base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #2d3748;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  /* App container */
  .app-container {
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Hero section */
  .hero-section {
    text-align: center;
    margin-bottom: 4rem;
    padding: 2rem 0;
  }

  .hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    color: white;
    margin-bottom: 1rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    letter-spacing: -0.02em;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.7;
  }

  /* Loading state */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    gap: 1rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    color: white;
    font-size: 1.1rem;
    font-weight: 500;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Error state */
  .error-container {
    background: white;
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-container h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #e53e3e;
  }

  .error-container p {
    color: #666;
    margin-bottom: 2rem;
  }

  .retry-button {
    background: linear-gradient(135deg, #e53e3e, #c53030);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(229, 62, 62, 0.3);
  }

  /* Empty state */
  .empty-state {
    background: white;
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .empty-state p {
    color: #666;
    margin-bottom: 2rem;
  }

  .refresh-button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .refresh-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  /* Projects grid */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    padding: 1rem 0;
  }

  /* Project card */
  .project-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
  }

  .project-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  /* Project image */
  .project-image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .project-card:hover .project-image {
    transform: scale(1.05);
  }

  .funding-badge {
    position: absolute;
    bottom: 12px;
    left: 12px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  /* Project content */
  .project-content {
    padding: 1.5rem;
  }

  .project-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a202c;
    margin-bottom: 0.75rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .project-description {
    color: #4a5568;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Progress section */
  .progress-section {
    margin-bottom: 1.5rem;
  }

  .progress-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.5rem;
  }

  .raised-amount {
    font-weight: 600;
    color: #10b981;
  }

  .goal-amount {
    font-weight: 500;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    border-radius: 4px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* Donate button */
  .donate-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .donate-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
  }

  .donate-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  .donate-button:hover::before {
    left: 100%;
  }

  .donate-icon {
    font-size: 1.1rem;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .app-container {
      padding: 1rem 0.5rem;
    }

    .projects-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .hero-section {
      margin-bottom: 2rem;
      padding: 1rem 0;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
</style>