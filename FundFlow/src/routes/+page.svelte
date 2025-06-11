<script>
  // Simple hardcoded projects for now - we'll connect to a database later
  const projects = [
    {
      id: 1,
      title: "Clean Water for Kibera",
      description: "Help us build a water purification system for Kibera slum",
      goalAmount: 500000,
      currentAmount: 125000,
      imageUrl: "https://via.placeholder.com/400x300"
    },
    {
      id: 2,
      title: "School Books for Rural Kids",
      description: "Provide textbooks for 200 students in rural Kenya",
      goalAmount: 200000,
      currentAmount: 75000,
      imageUrl: "https://via.placeholder.com/400x300"
    }
  ];
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-center mb-8">Support Social Projects Anonymously</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each projects as project}
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <img src={project.imageUrl} alt={project.title} class="w-full h-48 object-cover" />
        
        <div class="p-4">
          <h2 class="text-xl font-semibold mb-2">{project.title}</h2>
          <p class="text-gray-600 mb-4">{project.description}</p>
          
          <div class="mb-4">
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                class="bg-green-600 h-2.5 rounded-full" 
                style={`width: ${(project.currentAmount / project.goalAmount) * 100}%`}
              ></div>
            </div>
            <div class="flex justify-between mt-1 text-sm text-gray-600">
              <span>Ksh {project.currentAmount.toLocaleString()}</span>
              <span>Ksh {project.goalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <a 
            href={`/project/${project.id}`} 
            class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md transition"
          >
            Donate Now
          </a>
        </div>
      </div>
    {/each}
  </div>
</div>