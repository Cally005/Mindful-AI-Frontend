// app/api/whatsapp/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const wabaId = searchParams.get('waba_id');
  const phoneNumberId = searchParams.get('phone_number_id');
  
  // Redirect back to the WhatsApp integration page with the parameters
  // This will be handled by the frontend component
  if (code && wabaId && phoneNumberId) {
    const redirectUrl = `/whatsapp?code=${code}&waba_id=${wabaId}&phone_number_id=${phoneNumberId}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // If the required parameters are not present, redirect to the error page
  return NextResponse.redirect(new URL('/whatsapp?error=missing-params', request.url));
}