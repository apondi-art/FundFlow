<script>
  let email = ''
  let password = ''
  let error = ''
  let loading = false

  async function handleLogin() {
    loading = true
    error = ''

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        window.location.href = '/admin/dashboard'
      } else {
        const result = await response.json()
        error = result.message || 'Login failed'
      }
    } catch (e) {
      error = 'Network error. Please try again.'
    } finally {
      loading = false
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Admin Login
      </h2>
    </div>
    
    <form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
      <div class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {#if error}
        <div class="text-red-600 text-sm">{error}</div>
      {/if}

      <div>
        <button
          type="submit"
          disabled={loading}
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {#if loading}
            Logging in...
          {:else}
            Sign in
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>