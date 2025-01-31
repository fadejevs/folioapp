// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_KEY'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const restaurantName = document.getElementById('restaurantName').value;

    try {
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    restaurant_name: restaurantName,
                }
            }
        });

        if (error) throw error;

        // Create restaurant profile in Supabase
        const { error: profileError } = await supabase
            .from('restaurants')
            .insert([
                {
                    user_id: data.user.id,
                    name: restaurantName,
                    slug: restaurantName.toLowerCase().replace(/\s+/g, '-'),
                }
            ]);

        if (profileError) throw profileError;

        // Redirect to dashboard
        window.location.href = '/dashboard';

    } catch (error) {
        alert(error.message);
    }
}); 