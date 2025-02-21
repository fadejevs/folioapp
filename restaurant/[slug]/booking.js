// Debug helper is now in the HTML file

// Initialize Supabase
debug('Initializing Supabase...');
const supabaseUrl = 'https://vimymndsowtavwgituuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXltbmRzb3d0YXZ3Z2l0dXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjM0NjAsImV4cCI6MjA1Mzg5OTQ2MH0.dRv5cTsegB_ushmNzx-MCJFcUsdkdpngiHjNVWyiRI4'
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)
debug('Supabase initialized');

// Set minimum date to today
document.getElementById('bookingDate').min = new Date().toISOString().split('T')[0];

// Get restaurant info from URL
async function loadRestaurantInfo() {
    const slug = window.location.pathname.split('/')[2];
    debug(`Loading restaurant with slug: ${slug}`);
    
    try {
        const { data, error } = await supabaseClient
            .from('restaurants')
            .select('name, id, user_id')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        debug(`Restaurant data loaded: ${data.name}`);
        document.getElementById('restaurantName').textContent = `Book a table at ${data.name}`;
        return data;
    } catch (error) {
        debug(`Error loading restaurant: ${error.message}`);
        alert('Restaurant not found');
    }
}

// Handle booking submission
document.addEventListener('DOMContentLoaded', () => {
    debug('DOM Content Loaded');
    
    const form = document.getElementById('bookingForm');
    if (!form) {
        debug('ERROR: Booking form not found');
        return;
    }
    debug('Form found');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        debug('Form submitted');
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        try {
            const restaurant = await loadRestaurantInfo();
            debug('Got restaurant info');
            
            // Create booking
            const bookingData = {
                restaurant_id: restaurant.id,
                date: document.getElementById('bookingDate').value,
                time: document.getElementById('bookingTime').value,
                guests: parseInt(document.getElementById('guests').value),
                customer_name: document.getElementById('guestName').value,
                customer_email: document.getElementById('guestEmail').value,
                customer_phone: document.getElementById('guestPhone').value || null,
                status: 'pending'
            };

            debug(`Creating booking: ${JSON.stringify(bookingData)}`);

            const { data: booking, error } = await supabaseClient
                .from('bookings')
                .insert([bookingData])
                .select()
                .single();

            if (error) throw error;

            debug('Booking created successfully');
            alert(`Booking confirmed!\n\nBooking details:\nDate: ${bookingData.date}\nTime: ${bookingData.time}\nGuests: ${bookingData.guests}`);

            e.target.reset();
        } catch (error) {
            debug(`ERROR: ${error.message}`);
            alert('Failed to create booking. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Complete Booking';
        }
    });

    // Load restaurant info when page loads
    loadRestaurantInfo();
}); 