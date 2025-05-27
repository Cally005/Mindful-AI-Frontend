// app/api/whatsapp/webhook/route.ts
export async function GET(request:Request) {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    
    console.log("WhatsApp webhook verification request:", { mode, token, challenge });
    
    // Verify token - replace "123456789" with your actual verify token
    if (mode === 'subscribe' && token === '123456789') {
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    return new Response('Verification failed', { status: 403 });
  }
  
  export async function POST(request:Request) {
    console.log("WhatsApp webhook POST received");
    try {
      const body = await request.json();
      console.log("WhatsApp webhook body:", JSON.stringify(body, null, 2));
      
      // Here you can process the webhook event
      // For example, forward it to your backend API
      
      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      return new Response('Error', { status: 500 });
    }
  }