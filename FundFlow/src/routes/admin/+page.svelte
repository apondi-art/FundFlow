<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    // Redirect logic
    $: {
        if ($page.data.session?.admin) {
            goto('/admin/dashboard');
        } else {
            goto('/admin/login');
        }
    }
</script>

<!-- Optional: Loading state -->
<div class="flex justify-center items-center h-screen">
    <p>Redirecting...</p>
</div>