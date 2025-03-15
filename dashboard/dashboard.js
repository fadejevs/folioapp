// Debug helper
function debug(msg) {
    console.log(msg);
}

// Initialize Supabase client
const supabaseUrl = 'https://vimymndsowtavwgituuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXltbmRzb3d0YXZ3Z2l0dXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjM0NjAsImV4cCI6MjA1Mzg5OTQ2MH0.dRv5cTsegB_ushmNzx-MCJFcUsdkdpngiHjNVWyiRI4'
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = '/login/index.html';
    }
    return session;
}

async function loadRestaurantInfo() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const { data, error } = await supabaseClient
        .from('restaurants')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

    if (error) {
        console.error('Error loading restaurant:', error);
        return;
    }

    const bookingUrl = `${window.location.origin}/restaurant/${data.slug}`;
    document.getElementById('bookingUrl').value = bookingUrl;
}

async function loadRecentBookings() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const { data: restaurant } = await supabaseClient
        .from('restaurants')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

    const { data: bookings, error } = await supabaseClient
        .from('bookings')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error loading bookings:', error);
        return;
    }

    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <div class="booking-info">
                <strong>${booking.customer_name}</strong>
                <span>${new Date(booking.date).toLocaleDateString()} at ${booking.time}</span>
                <span>${booking.guests} guests</span>
                <span class="booking-contact">${booking.customer_email} ${booking.customer_phone ? `/ ${booking.customer_phone}` : ''}</span>
            </div>
            <div class="booking-actions">
                <div class="booking-status ${booking.status}">${booking.status}</div>
                ${booking.status === 'pending' ? `
                    <button class="confirm-btn" data-id="${booking.id}">Confirm</button>
                    <button class="cancel-btn" data-id="${booking.id}">Cancel</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function copyUrl() {
    const urlInput = document.getElementById('bookingUrl');
    urlInput.select();
    document.execCommand('copy');
    alert('URL copied to clipboard!');
}

async function logout() {
    debug('Logout clicked');
    try {
        await supabaseClient.auth.signOut();
        localStorage.removeItem('user');
        window.location.href = '/';
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
    try {
        const { data, error } = await supabaseClient
            .from('bookings')
            .update({ status: status })
            .eq('id', bookingId)
            .select();
        
        if (error) throw error;
        
        // Refresh bookings list
        loadRecentBookings();
        
        return { success: true, data };
    } catch (error) {
        console.error('Error updating booking:', error);
        return { success: false, error };
    }
}

// Handle booking actions
function setupBookingActions() {
    document.addEventListener('click', async (e) => {
        // Confirm booking
        if (e.target.classList.contains('confirm-btn')) {
            const bookingId = e.target.dataset.id;
            const result = await updateBookingStatus(bookingId, 'confirmed');
            
            if (result.success) {
                alert('Booking confirmed!');
            } else {
                alert('Failed to confirm booking. Please try again.');
            }
        }
        
        // Cancel booking
        if (e.target.classList.contains('cancel-btn')) {
            const bookingId = e.target.dataset.id;
            if (confirm('Are you sure you want to cancel this booking?')) {
                const result = await updateBookingStatus(bookingId, 'cancelled');
                
                if (result.success) {
                    alert('Booking cancelled.');
                } else {
                    alert('Failed to cancel booking. Please try again.');
                }
            }
        }
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    debug('Dashboard loaded');
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        debug('Logout button found');
        logoutBtn.addEventListener('click', logout);
    } else {
        debug('Logout button not found');
    }

    checkAuth().then(() => {
        loadRestaurantInfo();
        loadRecentBookings();
        setupBookingActions();
    });
}); 