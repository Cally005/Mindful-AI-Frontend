//component/whatapp/integration

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Check, MessageSquare, Unplug, Plus, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface WhatsAppAccount {
  waba_id: string;
  phone_number_id: string;
  display_phone_number?: string;
  verified_name: string;
}

interface PhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name: string;
  verification_status?: string; // expected: "NOT_VERIFIED" or "VERIFIED"
}

export function WhatsAppIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [accountDetails, setAccountDetails] = useState<WhatsAppAccount | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkWhatsAppConnection();
    fetchPhoneNumbers();
  }, []);

  const checkWhatsAppConnection = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${API_URL}/api/whatsapp/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          setConnected(true);
          setAccountDetails(data.data);
        }
      }
    } catch (err) {
      console.error('Error checking WhatsApp connection:', err);
    }
  };

  const fetchPhoneNumbers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${API_URL}/api/whatsapp/phone-numbers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          const mappedNumbers = data.data.map((num: any) => ({
            id: num.id,
            display_phone_number: num.display_phone_number,
            verified_name: num.verified_name,
            verification_status: num.verification_status, // "NOT_VERIFIED" or "VERIFIED"
          }));
          setPhoneNumbers(mappedNumbers);
        }
      }
    } catch (err) {
      console.error('Error fetching phone numbers:', err);
    }
  };

  const handleWhatsAppLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to connect to WhatsApp');
        return;
      }
      const redirectUri = process.env.NEXT_PUBLIC_WHATSAPP_CALLBACK_URI || `${window.location.origin}/whatsapp/callback`;
      const apiUrl = `${API_URL}/api/whatsapp/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned status ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      if (data.status && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        setError('Could not initiate WhatsApp integration');
      }
    } catch (err: any) {
      console.error('Error initiating WhatsApp integration:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to disconnect WhatsApp');
        return;
      }
      const response = await fetch(`${API_URL}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.status) {
        setConnected(false);
        setAccountDetails(null);
        setPhoneNumbers([]);
        setIsDisconnectDialogOpen(false);
      } else {
        setError(result.msg || 'Failed to disconnect WhatsApp account');
      }
    } catch (err: any) {
      console.error('Error disconnecting WhatsApp:', err);
      setError(err.message || 'An error occurred while disconnecting');
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to include mode parameter
  const navigateToPhoneNumberRegistration = (mode = '') => {
    if (mode === 'manage2fa') {
      router.push('/whatsapp/register-phone-number?mode=manage2fa');
    } else {
      router.push('/whatsapp/register-phone-number');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>WhatsApp Business Integration</CardTitle>
        <CardDescription>
          Connect and manage your WhatsApp Business account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {connected ? (
          <div className="space-y-4">
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertTitle>WhatsApp Connected</AlertTitle>
              <AlertDescription>
                Your account is successfully integrated
              </AlertDescription>
            </Alert>
            {accountDetails && (
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Business Account Name:</strong> {accountDetails.verified_name}
                </p>
                <p>
                  <strong>Business Account ID:</strong> {accountDetails.waba_id}
                </p>
                <p>
                  <strong>Phone Number ID:</strong> {accountDetails.phone_number_id}
                </p>
                {accountDetails.display_phone_number && (
                  <p>
                    <strong>Display Phone Number:</strong> {accountDetails.display_phone_number}
                  </p>
                )}
              </div>
            )}
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Registered Phone Numbers</h3>
              {phoneNumbers.length > 0 ? (
                <div className="space-y-2">
                  {phoneNumbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="p-3 rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p>
                          <strong>Number:</strong> {phone.display_phone_number}
                        </p>
                        <p>
                          <strong>Verified Name:</strong> {phone.verified_name}
                        </p>
                        <p>
                          <strong>Status:</strong>{' '}
                          {phone.verification_status === 'VERIFIED'
                            ? 'Verified'
                            : 'Not Verified'}
                        </p>
                      </div>
                      {phone.verification_status === 'VERIFIED' ? (
                        <>
                          <Check className="h-6 w-6 text-green-500" />
                          <Button
                            onClick={() => navigateToPhoneNumberRegistration('manage2fa')}
                            size="sm"
                            className="ml-2"
                          >
                            Manage 2FA
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => navigateToPhoneNumberRegistration()}
                          size="sm"
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No phone numbers registered
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              Connect your WhatsApp Business account to enable messaging features.
            </p>
            <p className="text-sm text-muted-foreground">
              You will be redirected to Meta to complete the connection process.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {connected ? (
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => setIsDisconnectDialogOpen(true)}
              disabled={isLoading}
            >
              <Unplug className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => navigateToPhoneNumberRegistration()}
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Phone Number
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleWhatsAppLogin}
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Connect WhatsApp
              </>
            )}
          </Button>
        )}
        <Dialog open={isDisconnectDialogOpen} onOpenChange={setIsDisconnectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect WhatsApp Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect your WhatsApp Business account? This will remove your current integration and registered phone numbers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDisconnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

















//working well just verification
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Loader2, Check, MessageSquare, Unplug, Plus } from 'lucide-react';

// // Define API URL from environment or default
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// interface WhatsAppAccount {
//   waba_id: string;
//   phone_number_id: string;
//   display_phone_number?: string;
//   verified_name: string;
// }

// interface PhoneNumber {
//   id: string;
//   display_phone_number: string;
//   verified_name: string;
//   status?: string;
// }

// export function WhatsAppIntegration() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [connected, setConnected] = useState(false);
//   const [accountDetails, setAccountDetails] = useState<WhatsAppAccount | null>(null);
//   const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
//   const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
//   const router = useRouter();

//   // Check WhatsApp connection status on component mount
//   useEffect(() => {
//     checkWhatsAppConnection();
//     fetchPhoneNumbers();
//   }, []);

//   // Check WhatsApp connection status
//   const checkWhatsAppConnection = async () => {
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         return;
//       }
      
//       const response = await fetch(`${API_URL}/api/whatsapp/account`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
        
//         if (data.status && data.data) {
//           setConnected(true);
//           setAccountDetails(data.data);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking WhatsApp connection:', error);
//     }
//   };

//   // Fetch phone numbers
//   const fetchPhoneNumbers = async () => {
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         return;
//       }
      
//       const response = await fetch(`${API_URL}/api/whatsapp/phone-numbers`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
        
//         if (data.status && data.data) {
//           setPhoneNumbers(data.data);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching phone numbers:', error);
//     }
//   };

//   // Initiate WhatsApp integration
//   const handleWhatsAppLogin = async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in to connect to WhatsApp');
//         return;
//       }
      
//       // Use fixed redirect URI for WhatsApp
//       const redirectUri = process.env.NEXT_PUBLIC_WHATSAPP_CALLBACK_URI || `${window.location.origin}/whatsapp/callback`;
      
//       const apiUrl = `${API_URL}/api/whatsapp/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
      
//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.status === 401 || response.status === 403) {
//         localStorage.removeItem('authToken');
//         router.push('/login');
//         return;
//       }
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API returned status ${response.status}: ${errorText}`);
//       }
      
//       const data = await response.json();
      
//       if (data.status && data.data?.url) {
//         // Redirect to WhatsApp authorization
//         window.location.href = data.data.url;
//       } else {
//         setError('Could not initiate WhatsApp integration');
//       }
//     } catch (error:any) {
//       console.error('Error initiating WhatsApp integration:', error);
//       setError(error.message || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Disconnect WhatsApp account
//   const handleDisconnect = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in to disconnect WhatsApp');
//         return;
//       }

//       const response = await fetch(`${API_URL}/api/whatsapp/disconnect`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const result = await response.json();

//       if (result.status) {
//         // Successful disconnection
//         setConnected(false);
//         setAccountDetails(null);
//         setPhoneNumbers([]);
//         setIsDisconnectDialogOpen(false);
//       } else {
//         setError(result.msg || 'Failed to disconnect WhatsApp account');
//       }
//     } catch (error:any) {
//       console.error('Error disconnecting WhatsApp:', error);
//       setError(error.message || 'An error occurred while disconnecting');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const navigateToPhoneNumberRegistration = () => {
//     router.push('/whatsapp/register-phone-number');
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader>
//         <CardTitle>WhatsApp Business Integration</CardTitle>
//         <CardDescription>
//           Connect and manage your WhatsApp Business account
//         </CardDescription>
//       </CardHeader>
      
//       <CardContent>
//         {error && (
//           <Alert variant="destructive" className="mb-4">
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
    
//         {connected ? (
//           <div className="space-y-4">
//             <Alert className="bg-green-50 text-green-800 border-green-200">
//               <Check className="h-4 w-4" />
//               <AlertTitle>WhatsApp Connected</AlertTitle>
//               <AlertDescription>
//                 Your WhatsApp Business account is successfully integrated
//               </AlertDescription>
//             </Alert>
            
//             {accountDetails && (
//               <div className="space-y-2 text-sm">
//                 <p>
//                   <strong>Business Account Name:</strong> {accountDetails.verified_name}
//                 </p>
//                 <p>
//                   <strong>Business Account ID:</strong> {accountDetails.waba_id}
//                 </p>
//                 <p>
//                   <strong>Phone Number ID:</strong> {accountDetails.phone_number_id}
//                 </p>
//                 {accountDetails.display_phone_number && (
//                   <p>
//                     <strong>Display Phone Number:</strong> {accountDetails.display_phone_number}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Phone Numbers Section */}
//             <div className="mt-4">
//               <h3 className="text-sm font-semibold mb-2">Registered Phone Numbers</h3>
//               {phoneNumbers.length > 0 ? (
//                 <div className="space-y-2">
//                   {phoneNumbers.map((phoneNumber) => (
//                     <div 
//                       key={phoneNumber.id} 
//                       className="bg-gray-100 p-3 rounded-md"
//                     >
//                       <p>
//                         <strong>Number:</strong> {phoneNumber.display_phone_number}
//                       </p>
//                       <p>
//                         <strong>Verified Name:</strong> {phoneNumber.verified_name}
//                       </p>
//                       {phoneNumber.status && (
//                         <p>
//                           <strong>Status:</strong> {phoneNumber.status}
//                         </p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-muted-foreground">
//                   No phone numbers registered
//                 </p>
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <p>
//               Connect your WhatsApp Business account to enable messaging features in your application.
//             </p>
//             <p className="text-sm text-muted-foreground">
//               You will be redirected to Meta to complete the connection process.
//             </p>
//           </div>
//         )}
//       </CardContent>
      
//       <CardFooter className="flex flex-col space-y-2">
//         {connected ? (
//           <div className="flex space-x-2 w-full">
//             <Button 
//               variant="outline" 
//               className="w-1/2" 
//               onClick={() => setIsDisconnectDialogOpen(true)}
//               disabled={isLoading}
//             >
//               <Unplug className="mr-2 h-4 w-4" />
//               Disconnect
//             </Button>
//             <Button 
//               variant="outline" 
//               className="w-1/2" 
//               onClick={navigateToPhoneNumberRegistration}
//               disabled={isLoading}
//             >
//               <Plus className="mr-2 h-4 w-4" />
//               Add Phone Number
//             </Button>
//           </div>
//         ) : (
//           <Button 
//             onClick={handleWhatsAppLogin} 
//             className="w-full bg-green-600 hover:bg-green-700" 
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Connecting...
//               </>
//             ) : (
//               <>
//                 <MessageSquare className="mr-2 h-4 w-4" />
//                 Connect WhatsApp
//               </>
//             )}
//           </Button>
//         )}

//         {/* Disconnect Confirmation Dialog */}
//         <Dialog 
//           open={isDisconnectDialogOpen} 
//           onOpenChange={setIsDisconnectDialogOpen}
//         >
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Disconnect WhatsApp Account</DialogTitle>
//               <DialogDescription>
//                 Are you sure you want to disconnect your WhatsApp Business account?
//                 This will remove your current integration and registered phone numbers.
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter>
//               <Button 
//                 variant="outline" 
//                 onClick={() => setIsDisconnectDialogOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button 
//                 variant="destructive" 
//                 onClick={handleDisconnect}
//                 disabled={isLoading}
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Disconnecting...
//                   </>
//                 ) : (
//                   'Disconnect'
//                 )}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </CardFooter>
//     </Card>
//   );
// }
















//working well but no integration to resgister phone number 
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import { Loader2, Check, MessageSquare, Unplug } from 'lucide-react';

// // Define API URL from environment or default
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// interface WhatsAppAccount {
//   waba_id: string;
//   phone_number_id: string;
//   display_phone_number?: string;
//     verified_name: string;
// }

// export function WhatsAppIntegration() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [connected, setConnected] = useState(false);
//   const [accountDetails, setAccountDetails] = useState<WhatsAppAccount | null>(null);
//   const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
//   const router = useRouter();

//   // Check WhatsApp connection status on component mount
//   useEffect(() => {
//     checkWhatsAppConnection();
//   }, []);

//   // Check WhatsApp connection status
//   const checkWhatsAppConnection = async () => {
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         return;
//       }
      
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/api/whatsapp/account`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
        
//         if (data.status && data.data) {
//           setConnected(true);
//           setAccountDetails(data.data);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking WhatsApp connection:', error);
//     }
//   };

//   // Initiate WhatsApp integration
//   const handleWhatsAppLogin = async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in to connect to WhatsApp');
//         return;
//       }
      
//       // Use fixed redirect URI for WhatsApp
//       const redirectUri = process.env.NEXT_PUBLIC_WHATSAPP_REDIRECT_URI || `${window.location.origin}/whatsapp/callback`;
//       console.log("Redirect URI:", redirectUri);
//       const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/api/whatsapp/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
//       console.log("Requesting authorization URL from:", apiUrl);
//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       console.log("Response status:", response.status);
      
//       if (response.status === 401 || response.status === 403) {
//         // Token is invalid or expired
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('user');
//         localStorage.removeItem('session');
        
//         router.push('/login');
//         return;
//       }
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("API error response:", errorText);
//         throw new Error(`API returned status ${response.status}: ${errorText}`);
//       }
      
//       const data = await response.json();
      
//       if (data.status && data.data?.url) {
//         // Redirect to WhatsApp authorization
//         window.location.href = data.data.url;
//       } else {
//         console.error("Invalid API response format:", data);
//         setError('Could not initiate WhatsApp integration: Invalid response format');
//       }
//     } catch (error:any) {
//       console.error('Error initiating WhatsApp integration:', error);
//       setError(error.message || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Disconnect WhatsApp account
//   const handleDisconnect = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in to disconnect WhatsApp');
//         return;
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/api/whatsapp/disconnect`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const result = await response.json();

//       if (result.status) {
//         // Successful disconnection
//         setConnected(false);
//         setAccountDetails(null);
//         setIsDisconnectDialogOpen(false);
//       } else {
//         // Handle disconnection failure
//         setError(result.msg || 'Failed to disconnect WhatsApp account');
//       }
//     } catch (error:any) {
//       console.error('Error disconnecting WhatsApp:', error);
//       setError(error.message || 'An error occurred while disconnecting');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader>
//         <CardTitle>WhatsApp Business Integration</CardTitle>
//         <CardDescription>
//           Connect and manage your WhatsApp Business account
//         </CardDescription>
//       </CardHeader>
      
//       <CardContent>
//         {error && (
//           <Alert variant="destructive" className="mb-4">
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         {connected ? (
//           <div className="space-y-4">
//             <Alert className="bg-green-50 text-green-800 border-green-200">
//               <Check className="h-4 w-4" />
//               <AlertTitle>WhatsApp Connected</AlertTitle>
//               <AlertDescription>
//                 Your WhatsApp Business account is successfully integrated
//               </AlertDescription>
//             </Alert>
            
//             {accountDetails && (
//               <div className="space-y-2 text-sm">
//                 <p>
//                   <strong>Business Account Name:</strong> {accountDetails.verified_name}
//                 </p>
//                 <p>
//                   <strong>Business Account ID:</strong> {accountDetails.waba_id}
//                 </p>
//                 <p>
//                   <strong>Phone Number ID:</strong> {accountDetails.phone_number_id}
//                 </p>
//                 {accountDetails.display_phone_number && (
//                   <p>
//                     <strong>Display Phone Number:</strong> {accountDetails.display_phone_number}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <p>
//               Connect your WhatsApp Business account to enable messaging features in your application.
//             </p>
//             <p className="text-sm text-muted-foreground">
//               You will be redirected to Meta to complete the connection process.
//             </p>
//           </div>
//         )}
//       </CardContent>
      
//       <CardFooter className="flex space-x-2">
//         {connected ? (
//           <>
//             <Button 
//               variant="outline" 
//               className="w-full" 
//               onClick={() => setIsDisconnectDialogOpen(true)}
//               disabled={isLoading}
//             >
//               <Unplug className="mr-2 h-4 w-4" />
//               Disconnect
//             </Button>

//             {/* Disconnect Confirmation Dialog */}
//             <Dialog 
//               open={isDisconnectDialogOpen} 
//               onOpenChange={setIsDisconnectDialogOpen}
//             >
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Disconnect WhatsApp Account</DialogTitle>
//                   <DialogDescription>
//                     Are you sure you want to disconnect your WhatsApp Business account?
//                     This will remove your current integration.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <DialogFooter>
//                   <Button 
//                     variant="outline" 
//                     onClick={() => setIsDisconnectDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                   <Button 
//                     variant="destructive" 
//                     onClick={handleDisconnect}
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Disconnecting...
//                       </>
//                     ) : (
//                       'Disconnect'
//                     )}
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           </>
//         ) : (
//           <Button 
//             onClick={handleWhatsAppLogin} 
//             className="w-full bg-green-600 hover:bg-green-700" 
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Connecting...
//               </>
//             ) : (
//               <>
//                 <MessageSquare className="mr-2 h-4 w-4" />
//                 Connect WhatsApp
//               </>
//             )}
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   );
// }


// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Loader2, Check, MessageSquare } from 'lucide-react';

// // Define API URL from environment or default
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export function WhatsAppIntegration() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [connected, setConnected] = useState(false);
//   const [accountDetails, setAccountDetails] = useState<any | null>(null);

//   // Check if WhatsApp is already connected
//   useEffect(() => {
//     checkWhatsAppConnection();
//   }, []);

//   // Check URL for code and complete integration
//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get('code');
//     const wabaId = urlParams.get('waba_id');
//     const phoneNumberId = urlParams.get('phone_number_id');
    
//     if (code && wabaId && phoneNumberId) {
//       handleCompleteIntegration(code, wabaId, phoneNumberId);
      
//       // Clean up URL
//       const url = new URL(window.location.href);
//       url.search = '';
//       window.history.replaceState({}, '', url.toString());
//     }
//   }, []);

//   const checkWhatsAppConnection = async () => {
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         return;
//       }
      
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/account`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
        
//         if (data.status && data.data) {
//           setConnected(true);
//           setAccountDetails(data.data);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking WhatsApp connection:', error);
//     }
//   };

//   const handleWhatsAppLogin = async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const token = localStorage.getItem('authToken');
//       console.log("Auth token present:", !!token);
      
//       if (!token) {
//         setError('You must be logged in to connect to WhatsApp');
//         return;
//       }
      
//       // Use fixed redirect URI for WhatsApp
//       const redirectUri = process.env.NEXT_PUBLIC_WHATSAPP_REDIRECT_URI || `${window.location.origin}/whatsapp`;
//       console.log("Redirect URI:", redirectUri);
      
//       const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/api/whatsapp/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
//       console.log("Requesting authorization URL from:", apiUrl);
      
//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       console.log("Response status:", response.status);
      
//       if (response.status === 401 || response.status === 403) {
//         // Token is invalid or expired
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('user');
//         localStorage.removeItem('session');
        
//         const router = useRouter();
//         router.push('/login'); // Redirect to login page
//         router.push('/login'); // Redirect to login page
//         return;
//       }
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("API error response:", errorText);
//         throw new Error(`API returned status ${response.status}: ${errorText}`);
//       }
      
//       const data = await response.json();
//       console.log("API response data:", data);
      
//       if (data.status && data.data?.url) {
//         // Redirect to WhatsApp authorization
//         window.location.href = data.data.url;
//       } else {
//         console.error("Invalid API response format:", data);
//         setError('Could not initiate WhatsApp integration: Invalid response format');
//       }
//     } catch (error:any) {
//       console.error('Error initiating WhatsApp integration:', error);
//       setError(error.message || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCompleteIntegration = async (code: string, wabaId: string, phoneNumberId: string) => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in to complete WhatsApp integration');
//         return;
//       }
      
//       const redirectUri = `${window.location.origin}/whatsapp`;
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/complete-integration`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           code,
//           waba_id: wabaId,
//           phone_number_id: phoneNumberId,
//           redirect_uri: redirectUri
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to complete WhatsApp integration');
//       }
      
//       const data = await response.json();
      
//       if (data.status) {
//         setConnected(true);
//         checkWhatsAppConnection();
//       } else {
//         setError(data.msg || 'Could not complete WhatsApp integration');
//       }
//     } catch (error: any) {
//       console.error('Error completing WhatsApp integration:', error);
//       setError(error.message || 'An error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader>
//         <CardTitle>WhatsApp Business Integration</CardTitle>
//         <CardDescription>
//           Connect your WhatsApp Business account to enable messaging
//         </CardDescription>
//       </CardHeader>
      
//       <CardContent>
//         {error && (
//           <Alert variant="destructive" className="mb-4">
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}
        
//         {connected ? (
//           <div className="space-y-2">
//             <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
//               <Check className="h-4 w-4" />
//               <AlertTitle>Connected to WhatsApp</AlertTitle>
//               <AlertDescription>
//                 Your WhatsApp Business account is successfully integrated
//               </AlertDescription>
//             </Alert>
            
//             {accountDetails && (
//               <div className="space-y-1 text-sm">
//                 <p><strong>Business Account ID:</strong> {accountDetails.waba_id}</p>
//                 <p><strong>Phone Number ID:</strong> {accountDetails.phone_number_id}</p>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <p>
//               Connect your WhatsApp Business account to enable messaging features in your application.
//             </p>
//             <p className="text-sm text-muted-foreground">
//               You will be redirected to Meta to complete the connection process.
//             </p>
//           </div>
//         )}
//       </CardContent>
      
//       <CardFooter>
//         {connected ? (
//           <Button variant="outline" className="w-full" disabled>
//             Already Connected
//           </Button>
//         ) : (
//           <Button 
//             onClick={handleWhatsAppLogin} 
//             className="w-full bg-green-600 hover:bg-green-700" 
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Connecting...
//               </>
//             ) : (
//               <>
//                 <MessageSquare className="mr-2 h-4 w-4" />
//                 Connect WhatsApp
//               </>
//             )}
//           </Button>
//         )}
//       </CardFooter>
//     </Card>
//   );
// }