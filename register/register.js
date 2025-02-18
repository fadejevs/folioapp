// Debug helper
function debug(msg) {
    console.log(msg);
    const debugEl = document.getElementById('debug');
    if (debugEl) {
        debugEl.style.display = 'block';
        debugEl.innerHTML += `<div>${msg}</div>`;
    }
}

// Initialize Supabase client
const supabaseUrl = 'https://vimymndsowtavwgituuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXltbmRzb3d0YXZ3Z2l0dXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjM0NjAsImV4cCI6MjA1Mzg5OTQ2MH0.dRv5cTsegB_ushmNzx-MCJFcUsdkdpngiHjNVWyiRI4'

try {
    debug('Initializing Supabase...');
    if (typeof supabase === 'undefined') {
        throw new Error('Supabase client not loaded');
    }
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)
    debug('Supabase initialized successfully');

    document.addEventListener('DOMContentLoaded', () => {
        debug('Register page loaded');
        
        const form = document.getElementById('registerForm');
        if (!form) {
            debug('ERROR: Register form not found!');
            return;
        }
        debug('Form found');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            debug('Form submitted');
            
            const submitButton = e.target.querySelector('button[type="submit"]');
            submitButton.textContent = 'Creating account...';
            submitButton.disabled = true;
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const restaurantName = document.getElementById('restaurantName').value.trim();

            try {
                // Basic validation
                if (!email || !email.includes('@') || !email.includes('.')) {
                    throw new Error('Please enter a valid email address');
                }

                if (password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }

                if (!restaurantName) {
                    throw new Error('Restaurant name is required');
                }

                debug(`Starting registration for ${email}`);
                
                // Sign up without email confirmation
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            restaurant_name: restaurantName
                        }
                    }
                });

                if (error) throw error;

                // Create restaurant profile
                const { error: profileError } = await supabaseClient
                    .from('restaurants')
                    .insert([{
                        user_id: data.user.id,
                        name: restaurantName,
                        slug: restaurantName.toLowerCase().replace(/\s+/g, '-')
                    }])
                    .select();

                if (profileError) throw profileError;

                // Store user session
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success and redirect
                alert('Account created successfully!');
                window.location.href = '/dashboard/index.html';

            } catch (error) {
                debug(`ERROR: ${error.message}`);
                alert(error.message);
                // Reset button state
                submitButton.textContent = 'Create Your Booking Page';
                submitButton.disabled = false;
            }
        });
    });

} catch (error) {
    debug(`INITIALIZATION ERROR: ${error.message}`);
    console.error('Initialization error:', error);
} 