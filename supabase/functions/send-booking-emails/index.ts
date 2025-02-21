import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking, restaurant, customerEmail, restaurantEmail } = await req.json()

    // Simple email content
    const customerEmailContent = `
      Your booking at ${restaurant.name} is confirmed!
      Date: ${booking.date}
      Time: ${booking.time}
      Guests: ${booking.guests}
    `

    const restaurantEmailContent = `
      New booking received!
      Customer: ${booking.customer_name}
      Date: ${booking.date}
      Time: ${booking.time}
      Guests: ${booking.guests}
      Contact: ${booking.customer_email} / ${booking.customer_phone || 'No phone provided'}
    `

    // Send emails using your preferred service (Resend, SendGrid, etc.)
    // For MVP, you could even use a simple SMTP service

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 