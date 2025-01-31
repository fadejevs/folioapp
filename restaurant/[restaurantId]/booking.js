document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bookingData = {
        restaurantId: window.location.pathname.split('/')[2],
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        guests: document.getElementById('guests').value,
        customerName: document.getElementById('guestName').value,
        customerEmail: document.getElementById('guestEmail').value,
        customerPhone: document.getElementById('guestPhone').value,
        status: 'Pending'
    };

    // Send to Zapier Webhook
    try {
        const response = await fetch('YOUR_ZAPIER_WEBHOOK_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            alert('Booking confirmed! Check your email for details.');
            window.location.reload();
        } else {
            alert('Something went wrong. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    }
});