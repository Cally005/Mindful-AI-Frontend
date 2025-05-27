//whatsapp/register-phone-number/page.tsx

'use client';

import { WhatsAppPhoneNumberRegistration } from "@/components/whatsapp/phone-number-registration";
import { useRouter } from 'next/navigation';

export default function RegisterPhoneNumberPage() {
  const router = useRouter();

  // Handle cancellation by navigating back to WhatsApp page
  const handleCancel = () => {
    router.push('/whatsapp');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Register WhatsApp Phone Number</h1>
        <WhatsAppPhoneNumberRegistration 
          onCancel={handleCancel} 
        />
      </div>
    </div>
  );
}