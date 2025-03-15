import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configure your SMTP settings
const client = new SmtpClient();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking, restaurant, customerEmail, restaurantEmail } = await req.json()

    // Customer email content
    const customerEmailContent = `
      <h2>Your booking at ${restaurant.name} is confirmed!</h2>
      <p>Thank you for your reservation. We're looking forward to seeing you.</p>
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Booking Status:</strong> ${booking.status}</p>
      </div>
      <p>If you need to make any changes to your reservation, please contact the restaurant directly.</p>
    `

    // Restaurant email content
    const restaurantEmailContent = `
      <h2>New booking received!</h2>
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <p><strong>Customer:</strong> ${booking.customer_name}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Time:</strong> ${booking.time}</p>
        <p><strong>Guests:</strong> ${booking.guests}</p>
        <p><strong>Contact:</strong> ${booking.customer_email} / ${booking.customer_phone || 'No phone provided'}</p>
      </div>
      <p>Log in to your dashboard to manage this booking.</p>
    `

    // Connect to SMTP server
    await client.connectTLS({
      hostname: "smtp.example.com", // Replace with your SMTP server
      port: 465,
      username: "your_username", // Replace with your email username
      password: "your_password", // Replace with your email password
    });

    // Send email to customer
    await client.send({
      from: "bookings@folio.com",
      to: booking.customer_email,
      subject: `Your booking at ${restaurant.name} is confirmed`,
      content: customerEmailContent,
      html: customerEmailContent,
    });

    // Send email to restaurant
    await client.send({
      from: "bookings@folio.com",
      to: restaurantEmail,
      subject: "New booking received",
      content: restaurantEmailContent,
      html: restaurantEmailContent,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 