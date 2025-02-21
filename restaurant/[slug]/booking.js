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
        
        // Add form validation debugging
        const formData = {
            date: document.getElementById('bookingDate').value,
            time: document.getElementById('bookingTime').value,
            guests: document.getElementById('guests').value,
            name: document.getElementById('guestName').value,
            email: document.getElementById('guestEmail').value,
            phone: document.getElementById('guestPhone').value
        };
        debug(`Form data: ${JSON.stringify(formData)}`);
        
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        try {
            const restaurant = await loadRestaurantInfo();
            if (!restaurant || !restaurant.id) {
                throw new Error('Restaurant data not found');
            }
            debug(`Restaurant ID: ${restaurant.id}`);
            
            // Create booking with required fields first
            const bookingData = {
                restaurant_id: restaurant.id,
                date: formData.date,
                time: formData.time,
                guests: parseInt(formData.guests),
                customer_name: formData.name,
                customer_email: formData.email,
                status: 'pending'
            };

            // Only add phone if provided
            if (formData.phone) {
                bookingData.customer_phone = formData.phone;
            }

            debug(`Creating booking: ${JSON.stringify(bookingData)}`);

            const { data: booking, error } = await supabaseClient
                .from('bookings')
                .insert([bookingData])
                .select()
                .single();

            if (error) {
                debug(`Supabase error: ${error.message}`);
                throw error;
            }

            debug(`Booking created: ${JSON.stringify(booking)}`);
            alert(`Booking confirmed!\n\nBooking details:\nDate: ${bookingData.date}\nTime: ${bookingData.time}\nGuests: ${bookingData.guests}`);

            // Clear form after successful booking
            e.target.reset();
            
            // Redirect to success page or show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <h2>Booking Confirmed!</h2>
                <p>Thank you for your booking. We'll see you on ${bookingData.date} at ${bookingData.time}.</p>
            `;
            form.parentNode.replaceChild(successMessage, form);
            
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