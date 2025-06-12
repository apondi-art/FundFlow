<script lang="ts">
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabase'

  let totalDonations = 0
  let totalProjects = 0
  let recentDonations = []

  onMount(async () => {
    await loadStats()
  })

  async function loadStats() {
    // Get total donations
    const { data: donations } = await supabase
      .from('donations')
      .select('amount')
    
    totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0

    // Get total projects
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
    
    totalProjects = projectsCount || 0

    // Get recent donations
    const { data: recent } = await supabase
      .from('donations')
      .select(`
        amount,
        status,
        created_at,
        projects (title)
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    recentDonations = recent || []
  }
</script>

<div class="space-y-6 p-4">
  <h1 class="text-2xl font-bold">Admin Dashboard</h1>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-500">Total Projects</h3>
      <p class="text-3xl font-bold">{totalProjects}</p>
    </div>

    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-500">Total Donations</h3>
      <p class="text-3xl font-bold">Ksh {totalDonations.toLocaleString()}</p>
    </div>

    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-500">Recent Donations</h3>
      <p class="text-3xl font-bold">{recentDonations.length}</p>
    </div>
  </div>

  <div class="bg-white p-4 rounded-lg shadow">
    <h3 class="text-lg font-medium mb-4">Recent Donations</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each recentDonations as donation}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{donation.projects?.title || 'General'}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">Ksh {donation.amount.toLocaleString()}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{new Date(donation.created_at).toLocaleDateString()}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  {donation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                  {donation.status}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>