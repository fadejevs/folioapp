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
            
            // Create booking with exact column names matching the database
            const bookingData = {
                restaurant_id: restaurant.id,
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone || null,  // Make sure it's null if empty
                date: formData.date,
                time: formData.time,
                guests: parseInt(formData.guests),
                status: 'pending'
            };

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
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <h2>Booking Confirmed!</h2>
                <p>Thank you for your booking. We'll see you on ${bookingData.date} at ${bookingData.time}.</p>
            `;
            
            // Replace form with success message
            const form = document.getElementById('bookingForm');
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

// Check if a time slot is available
async function checkTimeSlotAvailability(restaurantId, date, time) {
  try {
    const { data, error, count } = await supabaseClient
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('restaurant_id', restaurantId)
      .eq('date', date)
      .eq('time', time)
      .in('status', ['confirmed', 'pending']);
    
    if (error) throw error;
    
    // For now, assume max 4 bookings per time slot
    // In a real app, this would come from restaurant settings
    const MAX_BOOKINGS_PER_SLOT = 4;
    
    return {
      available: count < MAX_BOOKINGS_PER_SLOT,
      remaining: MAX_BOOKINGS_PER_SLOT - count
    };
  } catch (error) {
    console.error('Error checking availability:', error);
    return { available: false, error };
  }
}

// Update the time slot selection to check availability
document.getElementById('bookingDate').addEventListener('change', async function() {
  const date = this.value;
  const timeSelect = document.getElementById('bookingTime');
  const restaurant = await loadRestaurantInfo();
  
  // Reset options
  const defaultOption = timeSelect.querySelector('option[value=""]');
  timeSelect.innerHTML = '';
  timeSelect.appendChild(defaultOption);
  
  // Time slots
  const timeSlots = [
    { value: '17:00', label: '5:00 PM' },
    { value: '17:30', label: '5:30 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '18:30', label: '6:30 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '19:30', label: '7:30 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '20:30', label: '8:30 PM' },
    { value: '21:00', label: '9:00 PM' }
  ];
  
  // Check availability for each time slot
  for (const slot of timeSlots) {
    const { available, remaining } = await checkTimeSlotAvailability(
      restaurant.id, 
      date, 
      slot.value
    );
    
    const option = document.createElement('option');
    option.value = slot.value;
    option.textContent = `${slot.label} ${available ? `(${remaining} tables left)` : '(Fully booked)'}`;
    option.disabled = !available;
    
    timeSelect.appendChild(option);
  }
}); 