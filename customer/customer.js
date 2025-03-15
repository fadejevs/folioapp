// Initialize Supabase client
const supabaseUrl = 'https://vimymndsowtavwgituuu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXltbmRzb3d0YXZ3Z2l0dXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzMjM0NjAsImV4cCI6MjA1Mzg5OTQ2MH0.dRv5cTsegB_ushmNzx-MCJFcUsdkdpngiHjNVWyiRI4'
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)

// Get customer bookings by email
async function getCustomerBookings() {
  try {
    // Get email from URL parameter or session
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (!email) {
      document.getElementById('bookingsList').innerHTML = `
        <div class="no-bookings">
          <p>Please provide your email to view your bookings.</p>
          <form id="emailForm">
            <div class="form-group">
              <input type="email" id="customerEmail" required>
              <label for="customerEmail">Your Email</label>
            </div>
            <button type="submit" class="primary-btn">Find My Bookings</button>
          </form>
        </div>
      `;
      
      // Set up form submission
      document.getElementById('emailForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('customerEmail').value;
        window.location.href = `?email=${encodeURIComponent(email)}`;
      });
      
      return;
    }
    
    // Fetch bookings for this email
    const { data: bookings, error } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        restaurants:restaurant_id (
          name
        )
      `)
      .eq('customer_email', email)
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    const bookingsList = document.getElementById('bookingsList');
    
    if (!bookings || bookings.length === 0) {
      bookingsList.innerHTML = `
        <div class="no-bookings">
          <p>No bookings found for ${email}.</p>
          <p>If you've made a booking recently, it might not be in our system yet.</p>
        </div>
      `;
      return;
    }
    
    // Group bookings by status
    const upcoming = bookings.filter(b => 
      new Date(`${b.date}T${b.time}`) > new Date() && 
      (b.status === 'confirmed' || b.status === 'pending')
    );
    
    const past = bookings.filter(b => 
      new Date(`${b.date}T${b.time}`) < new Date() || 
      b.status === 'cancelled'
    );
    
    bookingsList.innerHTML = `
      <div class="email-display">Showing bookings for: <strong>${email}</strong></div>
      
      <h4>Upcoming Reservations</h4>
      ${upcoming.length === 0 ? '<p>No upcoming reservations.</p>' : ''}
      <div class="bookings-grid">
        ${upcoming.map(booking => `
          <div class="booking-card ${booking.status}">
            <div class="booking-restaurant">${booking.restaurants.name}</div>
            <div class="booking-date">${new Date(booking.date).toLocaleDateString()}</div>
            <div class="booking-time">${booking.time}</div>
            <div class="booking-guests">${booking.guests} guests</div>
            <div class="booking-status">${booking.status}</div>
          </div>
        `).join('')}
      </div>
      
      <h4>Past Reservations</h4>
      ${past.length === 0 ? '<p>No past reservations.</p>' : ''}
      <div class="bookings-grid past">
        ${past.map(booking => `
          <div class="booking-card ${booking.status}">
            <div class="booking-restaurant">${booking.restaurants.name}</div>
            <div class="booking-date">${new Date(booking.date).toLocaleDateString()}</div>
            <div class="booking-time">${booking.time}</div>
            <div class="booking-guests">${booking.guests} guests</div>
            <div class="booking-status">${booking.status}</div>
          </div>
        `).join('')}
      </div>
    `;
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    document.getElementById('bookingsList').innerHTML = `
      <div class="error">
        <p>Error loading bookings. Please try again later.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  }
}

// Add CSS styles
function addCustomerStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .bookings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .booking-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #ccc;
    }
    
    .booking-card.confirmed {
      border-left-color: var(--accent-mint);
    }
    
    .booking-card.pending {
      border-left-color: #F59E0B;
    }
    
    .booking-card.cancelled {
      border-left-color: #EF4444;
      opacity: 0.7;
    }
    
    .booking-restaurant {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    
    .booking-date, .booking-time {
      color: var(--text-gray);
    }
    
    .booking-guests {
      margin: 0.5rem 0;
    }
    
    .booking-status {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }
    
    .booking-card.confirmed .booking-status {
      background: #E7F9F0;
      color: #2AC673;
    }
    
    .booking-card.pending .booking-status {
      background: #FFF3DC;
      color: #B25E09;
    }
    
    .booking-card.cancelled .booking-status {
      background: #FEE2E2;
      color: #EF4444;
    }
    
    .email-display {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .bookings-grid.past {
      opacity: 0.7;
    }
    
    h4 {
      margin: 1.5rem 0 1rem;
    }
    
    .no-bookings {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }
    
    .no-bookings form {
      max-width: 400px;
      margin: 1.5rem auto 0;
    }
  `;
  document.head.appendChild(style);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  addCustomerStyles();
  getCustomerBookings();
  
  // Add logout functionality if needed
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      window.location.href = '/';
    });
  }
}); 