<script>
  export let data
</script>

<div class="min-h-screen bg-gray-50">
  {#if data.session}
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <a href="/admin/dashboard" class="btn btn-ghost normal-case text-xl">Admin Panel</a>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li><a href="/admin/projects">Projects</a></li>
          <li><a href="/admin/donations">Donations</a></li>
          <li>
            <form method="POST" action="/admin/logout">
              <button type="submit">Logout</button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  {/if}

  <div class="container mx-auto p-4">
    <slot />
  </div>
</div>