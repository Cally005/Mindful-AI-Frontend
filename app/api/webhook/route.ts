// app/api/webhook/route.ts
export async function GET(request:Request) {
    const url = new URL(request.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    
    console.log("WhatsApp webhook verification request:", { mode, token, challenge });
    
    // Verify token - must match what's configured in Meta Dashboard
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
      console.log("WhatsApp webhook payload:", JSON.stringify(body, null, 2));
      
      // Process WhatsApp webhook event
      if (body.object === 'whatsapp_business_account') {
        const entries = body.entry || [];
        
        for (const entry of entries) {
          // Process WhatsApp Business Account events
          const changes = entry.changes || [];
          
          for (const change of changes) {
            if (change.field === 'messages') {
              await processMessageEvent(change.value);
            }
          }
        }
      }
      
      // Always return success to Meta
      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      return new Response('Error', { status: 500 });
    }
  }
  
  // Helper function to process message events
  async function processMessageEvent(value: any) {
    try {
      const messages = value.messages || [];
      
      for (const message of messages) {
        console.log("Processing WhatsApp message:", message);
        
        // Here you would typically:
        // 1. Extract relevant data (sender, message content, etc.)
        // 2. Forward to your backend or process directly
        // 3. Store in database if needed
        
        // Example: Forward to your backend API
        const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';
        
        try {
          await fetch(`${BACKEND_API_URL}/api/whatsapp/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message,
              metadata: {
                received_at: new Date().toISOString(),
              }
            }),
          });
        } catch (apiError) {
          console.error("Error forwarding to backend:", apiError);
          // Continue processing other messages even if API call fails
        }
      }
    } catch (error) {
      console.error("Error in processMessageEvent:", error);
    }
  }