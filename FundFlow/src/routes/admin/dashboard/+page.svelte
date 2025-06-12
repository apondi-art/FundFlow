<script>
    // We'll add data loading in the next step
    let totalDonations = 0;
    let totalProjects = 0;
    let recentDonations = [];
</script>

<div class="space-y-6">
    <h2 class="text-2xl font-bold">Dashboard Overview</h2>

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
            <h3 class="text-lg font-medium text-gray-500">Recent Activity</h3>
            <p class="text-3xl font-bold">{recentDonations.length}</p>
        </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-4">Recent Donations</h3>
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each recentDonations as donation}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{donation.projectTitle}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Ksh {donation.amount.toLocaleString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(donation.createdAt).toLocaleDateString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    {donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                     donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-red-100 text-red-800'}">
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