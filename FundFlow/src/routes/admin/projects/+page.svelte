<script lang="ts">
  import { supabase } from '$lib/supabase'
  import { onMount } from 'svelte'

  let projects = []
  let newProject = {
    title: '',
    description: '',
    goal_amount: 0,
    image_url: ''
  }

  onMount(async () => {
    await loadProjects()
  })

  async function loadProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    projects = data || []
  }

  async function addProject() {
    const { error } = await supabase
      .from('projects')
      .insert(newProject)
    
    if (!error) {
      newProject = {
        title: '',
        description: '',
        goal_amount: 0,
        image_url: ''
      }
      await loadProjects()
    }
  }

  async function deleteProject(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      await loadProjects()
    }
  }
</script>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Manage Projects</h1>

  <!-- Add Project Form -->
  <div class="card bg-base-100 shadow mb-6">
    <div class="card-body">
      <h2 class="card-title">Add New Project</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input bind:value={newProject.title} placeholder="Title" class="input input-bordered">
        <input bind:value={newProject.goal_amount} type="number" placeholder="Goal Amount" class="input input-bordered">
        <input bind:value={newProject.image_url} placeholder="Image URL" class="input input-bordered col-span-2">
        <textarea bind:value={newProject.description} placeholder="Description" class="textarea textarea-bordered col-span-2"></textarea>
      </div>
      <button on:click={addProject} class="btn btn-primary mt-4">Add Project</button>
    </div>
  </div>

  <!-- Projects List -->
  <div class="overflow-x-auto">
    <table class="table w-full">
      <thead>
        <tr>
          <th>Title</th>
          <th>Goal</th>
          <th>Raised</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each projects as project}
          <tr>
            <td>{project.title}</td>
            <td>Ksh {project.goal_amount.toLocaleString()}</td>
            <td>Ksh {project.current_amount.toLocaleString()}</td>
            <td>
              <button on:click={() => deleteProject(project.id)} class="btn btn-error btn-sm">Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>