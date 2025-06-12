/** @type {import('./$types').LayoutServerLoad} */
export const load = async ({ cookies, locals }) => {
    const sessionCookie = cookies.get('admin-session');
    const session = sessionCookie ? JSON.parse(sessionCookie) : null;
    
    return {
        session
    };
};