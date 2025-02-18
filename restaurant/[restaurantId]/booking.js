// Initialize Supabase
const supabaseUrl = 'https://vimymndsowtavwgituuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXltbmRzb3d0YXZ3Z2l0dXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjM0NjAsImV4cCI6MjA1Mzg5OTQ2MH0.dRv5cTsegB_ushmNzx-MCJFcUsdkdpngiHjNVWyiRI4'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// Set minimum date to today
document.getElementById('bookingDate').min = new Date().toISOString().split('T')[0];

// Get restaurant info
async function loadRestaurantInfo() {
    const slug = window.location.pathname.split('/')[2];
    
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select('name, id')
            .eq('slug', slug)
            .single();

        if (error) throw error;

        document.getElementById('restaurantName').textContent = `Book a table at ${data.name}`;
        return data.id;
    } catch (error) {
        console.error('Error loading restaurant:', error);
        alert('Restaurant not found');
    }
}

// Handle booking submission
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    try {
        const restaurantId = await loadRestaurantInfo();
        const bookingData = {
            restaurant_id: restaurantId,
            date: document.getElementById('bookingDate').value,
            time: document.getElementById('bookingTime').value,
            guests: parseInt(document.getElementById('guests').value),
            customer_name: document.getElementById('guestName').value,
            customer_email: document.getElementById('guestEmail').value,
            customer_phone: document.getElementById('guestPhone').value || null,
            status: 'pending'
        };

        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select();

        if (error) throw error;

        alert('Booking confirmed! Check your email for details.');
        e.target.reset();
    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Failed to create booking. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Complete Booking';
    }
});

// Load restaurant info on page load
loadRestaurantInfo();