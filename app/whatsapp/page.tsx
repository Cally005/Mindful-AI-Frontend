// // app/whatsapp/page.tsx
// 'use client';

// import { WhatsAppIntegration } from "@/components/whatsapp/integrattion";


// export default function WhatsAppPage() {
//   return (
//     <div className="container mx-auto py-8">
//       <div className="max-w-3xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">WhatsApp Business Integration</h1>
//         <WhatsAppIntegration />
//       </div>
//     </div>
//   );
// }

// app/whatsapp/page.tsx
'use client';

import { useState } from 'react';
import { WhatsAppIntegration } from "@/components/whatsapp/integrattion";
import { WhatsAppPhoneNumberRegistration } from "@/components/whatsapp/phone-number-registration";

export default function WhatsAppPage() {
  const [view, setView] = useState<'integration' | 'register-phone'>('integration');

  // Define handleCancel method
  const handleCancel = () => {
    setView('integration');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {view === 'integration' 
            ? 'WhatsApp Business Integration' 
            : 'Register WhatsApp Phone Number'}
        </h1>
        {view === 'integration' ? (
          <WhatsAppIntegration />
        ) : (
          <WhatsAppPhoneNumberRegistration 
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}