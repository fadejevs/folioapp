// Debug helper
function debug(msg) {
    console.log(msg);
}

// Initialize Supabase client
const supabaseUrl = 'https://vimymndsowtavwgituuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXltbmRzb3d0YXZ3Z2l0dXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjM0NjAsImV4cCI6MjA1Mzg5OTQ2MH0.dRv5cTsegB_ushmNzx-MCJFcUsdkdpngiHjNVWyiRI4'
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    debug('Login page loaded');
    
    const form = document.getElementById('loginForm');
    if (!form) {
        debug('ERROR: Login form not found!');
        return;
    }
    debug('Form found');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        debug('Form submitted');
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            debug(`Attempting login for ${email}`);
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            debug('Login successful');
            
            // Store user session
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to dashboard
            window.location.href = '/dashboard/index.html';

        } catch (error) {
            debug(`ERROR: ${error.message}`);
            alert(error.message);
            // Reset button state
            submitButton.textContent = 'Log In';
            submitButton.disabled = false;
        }
    });
}); 