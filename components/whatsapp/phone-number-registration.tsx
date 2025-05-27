'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface WhatsAppPhoneNumberRegistrationProps {
  onCancel?: () => void;
}

const PHONE_NUMBER_REQUIREMENTS = [
  'Must be owned by you',
  'Must have a country and area code',
  'Cannot be a short code',
  'Must be able to receive voice calls or SMS',
  'Not already in use with WhatsApp Messenger or WhatsApp Business app',
  'Not banned',
];

export function WhatsAppPhoneNumberRegistration({
  onCancel,
}: WhatsAppPhoneNumberRegistrationProps) {
  // Steps:
  // - 'checking': fetching phone numbers
  // - 'requirements': show requirements if no numbers exist
  // - 'input': enter new phone details
  // - 'verify-code': enter verification code
  // - 'two-factor-prompt': ask if 2FA is enabled
  // - 'two-factor': if yes, prompt for PIN
  // - 'cloud-api-registration': register with Cloud API
  // - 'complete': final confirmation
  const [step, setStep] = useState<
    'checking' |
    'requirements' |
    'input' |
    'verify-code' |
    'two-factor-prompt' |
    'two-factor' |
    'cloud-api-registration' |
    'complete'
  >('checking');

  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    country_code: '',
    phone_number: '',
    verified_name: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const [managingExistingNumber, setManagingExistingNumber] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use a ref to track if the fetchPhoneNumbers function has been called
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Check if we're managing an existing number (coming from "Manage 2FA" button)
    const mode = searchParams?.get('mode');
    if (mode === 'manage2fa') {
      setManagingExistingNumber(true);
    }
    
    // Only fetch phone numbers once
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchPhoneNumbers();
    }
  }, [searchParams]);

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in');
        setStep('requirements');
        return;
      }
      const response = await fetch(`${API_URL}/api/whatsapp/phone-numbers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.status) {
        setPhoneNumbers(result.data);
        if (result.data.length === 0) {
          setStep('requirements');
        } else {
          // Select the first number and check its verification status.
          const firstNumber = result.data[0];
          setSelectedPhoneNumber(firstNumber);
          
          // IMPORTANT: Check if we're in manage 2FA mode
          if (managingExistingNumber) {
            // Skip directly to 2FA management, don't go through verification
            setStep('two-factor-prompt');
          } else if (firstNumber.verification_status === 'NOT_VERIFIED') {
            setStep('verify-code');
          } else {
            setStep('two-factor-prompt');
          }
        }
      } else {
        setError(result.msg || 'Failed to fetch phone numbers');
        setStep('requirements');
      }
    } catch (err) {
      console.error('Error fetching phone numbers:', err);
      setError('An error occurred while fetching phone numbers');
      setStep('requirements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/whatsapp');
    }
  };

  const registerPhoneNumber = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in to register a phone number');
        return;
      }
      const response = await fetch(`${API_URL}/api/whatsapp/register-phone-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          country_code: formData.country_code,
          phone_number: formData.phone_number,
          verified_name: formData.verified_name,
        }),
      });
      const result = await response.json();
      if (result.status) {
        setSelectedPhoneNumber({ id: result.data.phone_number_id });
        setStep('verify-code');
      } else {
        setError(result.msg || 'Failed to register phone number');
      }
    } catch (err) {
      console.error('Phone number registration error:', err);
      setError('An error occurred while registering the phone number');
    } finally {
      setIsLoading(false);
    }
  };

  // Request the verification code, but only when explicitly called
  const requestVerificationCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in');
        return;
      }
      const response = await fetch(`${API_URL}/api/whatsapp/request-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number_id: selectedPhoneNumber.id,
        }),
      });
      const result = await response.json();
      if (!result.status) {
        setError(result.msg || 'Failed to request verification code');
      } else {
        setCodeRequested(true);
      }
    } catch (err) {
      console.error('Error requesting verification code:', err);
      setError('An error occurred while requesting verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhoneNumber = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in');
        return;
      }
      const response = await fetch(`${API_URL}/api/whatsapp/verify-phone-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number_id: selectedPhoneNumber.id,
          verification_code: verificationCode,
        }),
      });
      const result = await response.json();
      if (result.status) {
        // After successful verification, ask about 2FA.
        setStep('two-factor-prompt');
      } else {
        setError(result.msg || 'Failed to verify phone number');
      }
    } catch (err) {
      console.error('Error verifying phone number:', err);
      setError('An error occurred while verifying phone number');
    } finally {
      setIsLoading(false);
    }
  };

  // Register with the Cloud API, sending the twoFactorPin if provided.
  const registerForCloudAPI = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in');
        return;
      }
      const response = await fetch(`${API_URL}/api/whatsapp/register-cloud-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number_id: selectedPhoneNumber.id,
          two_factor_pin: twoFactorPin, // if empty, API should treat as 2FA disabled
        }),
      });
      const result = await response.json();
      if (result.status) {
        setStep('complete');
      } else {
        setError(result.msg || 'Failed to register for Cloud API');
      }
    } catch (err) {
      console.error('Error registering for Cloud API:', err);
      setError('An error occurred while registering for Cloud API');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'checking':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Checking Phone Number Status</CardTitle>
              <CardDescription>
                Retrieving your WhatsApp Business phone number information...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
              <p>Please wait while we check your phone number status</p>
            </CardContent>
          </Card>
        );
      case 'requirements':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Phone Number Requirements</CardTitle>
              <CardDescription>
                Please review the requirements before proceeding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {PHONE_NUMBER_REQUIREMENTS.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 mt-1 h-4 w-4 text-green-500" />
                    {req}
                  </li>
                ))}
              </ul>
              <div className="flex space-x-2 mt-4">
                <Button variant="outline" onClick={handleCancel} className="w-1/2">
                  Cancel
                </Button>
                <Button onClick={() => setStep('input')} className="w-1/2">
                  Proceed to Registration
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'input':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Register Phone Number</CardTitle>
              <CardDescription>
                Enter your WhatsApp Business phone number details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="country_code">Country Code</Label>
                <Input
                  id="country_code"
                  name="country_code"
                  placeholder="1"
                  value={formData.country_code}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="5551234567"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="verified_name">Business Name</Label>
                <Input
                  id="verified_name"
                  name="verified_name"
                  placeholder="Your Business Name"
                  value={formData.verified_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('requirements')} className="w-1/2">
                  Back
                </Button>
                <Button onClick={registerPhoneNumber} disabled={isLoading} className="w-1/2">
                  {isLoading ? 'Registering...' : 'Register Phone Number'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'verify-code':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Verify Phone Number</CardTitle>
              <CardDescription>
                Enter the verification code sent to your phone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="verification_code">Verification Code</Label>
                <Input
                  id="verification_code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={requestVerificationCode} 
                disabled={isLoading}
                className="w-full mb-4"
              >
                {isLoading ? 'Requesting...' : codeRequested ? 'Request New Code' : 'Request Verification Code'}
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('input')} className="w-1/2">
                  Back
                </Button>
                <Button
                  onClick={verifyPhoneNumber}
                  disabled={isLoading || !verificationCode}
                  className="w-1/2"
                >
                  {isLoading ? 'Verifying...' : 'Verify Phone Number'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'two-factor-prompt':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Is two-factor authentication enabled for this phone number?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <div className="flex space-x-2">
                <Button onClick={() => setStep('two-factor')} className="w-1/2">
                  Yes, I have 2FA
                </Button>
                <Button onClick={() => setStep('cloud-api-registration')} className="w-1/2">
                  No, disable 2FA
                </Button>
              </div>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        );
      case 'two-factor':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Enter Two-Factor PIN</CardTitle>
              <CardDescription>
                Provide your current 2FA PIN or disable 2FA before proceeding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label htmlFor="two_factor_pin">Two-Factor PIN</Label>
                <Input
                  id="two_factor_pin"
                  placeholder="Enter 6-digit PIN"
                  value={twoFactorPin}
                  onChange={(e) => setTwoFactorPin(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setStep('two-factor-prompt')} className="w-1/2">
                  Back
                </Button>
                <Button
                  onClick={registerForCloudAPI}
                  disabled={isLoading || twoFactorPin.length !== 6}
                  className="w-1/2"
                >
                  {isLoading ? 'Registering...' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case 'cloud-api-registration':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Register for Cloud API</CardTitle>
              <CardDescription>
                Completing Cloud API integration
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Button onClick={registerForCloudAPI} disabled={isLoading} className="w-full">
                {isLoading ? 'Registering...' : 'Register for Cloud API'}
              </Button>
            </CardContent>
          </Card>
        );
      case 'complete':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Registration Complete</CardTitle>
              <CardDescription>
                Your phone number is now fully integrated with Cloud API
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center mb-4">
                Congratulations! Your WhatsApp Business phone number is now registered and integrated.
              </p>
              <Button onClick={handleCancel} className="w-full">
                Return to WhatsApp Integration
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">{renderStep()}</div>
    </div>
  );
}






// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// // Use the API_URL from the environment or a default
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// interface WhatsAppPhoneNumberRegistrationProps {
//   onCancel?: () => void;
// }

// // The phone number requirements that are shown to the user
// const PHONE_NUMBER_REQUIREMENTS = [
//   'Must be owned by you',
//   'Must have a country and area code',
//   'Cannot be a short code',
//   'Must be able to receive voice calls or SMS',
//   'Not already in use with WhatsApp Messenger or WhatsApp Business app',
//   'Not banned'
// ];

// export function WhatsAppPhoneNumberRegistration({ onCancel }: WhatsAppPhoneNumberRegistrationProps) {
//   // Define all steps in the flow
//   const [step, setStep] = useState<
//     'checking' |
//     'requirements' |
//     'input' |
//     'verify-code' |
//     'two-factor' |
//     'cloud-api-registration' |
//     'complete'
//   >('checking');

//   // Manage phone numbers and form state
//   const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
//   const [formData, setFormData] = useState({
//     country_code: '',
//     phone_number: '',
//     verified_name: ''
//   });
//   const [verificationCode, setVerificationCode] = useState('');
//   const [twoFactorPin, setTwoFactorPin] = useState('');
//   const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   // On component mount, fetch any existing phone numbers
//   useEffect(() => {
//     fetchPhoneNumbers();
//   }, []);

//   // Fetch existing phone numbers for the logged-in user
//   const fetchPhoneNumbers = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         setError('You must be logged in');
//         setStep('requirements');
//         return;
//       }
//       const response = await fetch(`${API_URL}/api/whatsapp/phone-numbers`, {
//         headers: { 'Authorization': `Bearer ${token}` }
//       });
//       const result = await response.json();
//       if (result.status) {
//         setPhoneNumbers(result.data);
//         // If no phone numbers exist, show the requirements then input step
//         if (result.data.length === 0) {
//           setStep('requirements');
//         } else {
//           // Use the first phone number and check its verification status
//           const firstNumber = result.data[0];
//           if (firstNumber.verification_status === 'NOT_VERIFIED') {
//             setSelectedPhoneNumber(firstNumber);
//             setStep('verify-code');
//           } else {
//             setStep('cloud-api-registration');
//           }
//         }
//       } else {
//         setError(result.msg || 'Failed to fetch phone numbers');
//         setStep('requirements');
//       }
//     } catch (error) {
//       console.error('Error fetching phone numbers:', error);
//       setError('An error occurred while fetching phone numbers');
//       setStep('requirements');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Update form data when inputs change
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // Cancel the registration flow, using onCancel prop or routing back
//   const handleCancel = () => {
//     if (onCancel) {
//       onCancel();
//     } else {
//       router.push('/whatsapp');
//     }
//   };

//   // Register a new phone number using the entered details
//   const registerPhoneNumber = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         setError('You must be logged in to register a phone number');
//         return;
//       }
//       const response = await fetch(`${API_URL}/api/whatsapp/register-phone-number`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           country_code: formData.country_code,
//           phone_number: formData.phone_number,
//           verified_name: formData.verified_name
//         })
//       });
//       const result = await response.json();
//       if (result.status) {
//         // Save the new phone number ID and move to verification step
//         setSelectedPhoneNumber({ id: result.data.phone_number_id });
//         setStep('verify-code');
//       } else {
//         setError(result.msg || 'Failed to register phone number');
//       }
//     } catch (error) {
//       console.error('Phone number registration error:', error);
//       setError('An error occurred while registering the phone number');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Request a verification code for the selected phone number
//   const requestVerificationCode = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         setError('You must be logged in');
//         return;
//       }
//       const response = await fetch(`${API_URL}/api/whatsapp/request-verification-code`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           phone_number_id: selectedPhoneNumber.id
//         })
//       });
//       const result = await response.json();
//       if (result.status) {
//         setStep('verify-code');
//       } else {
//         setError(result.msg || 'Failed to request verification code');
//       }
//     } catch (error) {
//       console.error('Error requesting verification code:', error);
//       setError('An error occurred while requesting verification code');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Verify the phone number with the provided verification code
//   const verifyPhoneNumber = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         setError('You must be logged in');
//         return;
//       }
//       const response = await fetch(`${API_URL}/api/whatsapp/verify-phone-number`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           phone_number_id: selectedPhoneNumber.id,
//           verification_code: verificationCode
//         })
//       });
//       const result = await response.json();
//       if (result.status) {
//         // If two-factor authentication is enabled, move to that step
//         if (result.data.two_factor_enabled) {
//           setStep('two-factor');
//         } else {
//           setStep('cloud-api-registration');
//         }
//       } else {
//         setError(result.msg || 'Failed to verify phone number');
//       }
//     } catch (error) {
//       console.error('Error verifying phone number:', error);
//       setError('An error occurred while verifying phone number');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Complete registration for the Cloud API
//   const registerForCloudAPI = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem('authToken');
//       if (!token) {
//         setError('You must be logged in');
//         return;
//       }
//       const response = await fetch(`${API_URL}/api/whatsapp/register-cloud-api`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           phone_number_id: selectedPhoneNumber.id,
//           two_factor_pin: twoFactorPin // Optional if not needed
//         })
//       });
//       const result = await response.json();
//       if (result.status) {
//         setStep('complete');
//       } else {
//         setError(result.msg || 'Failed to register for Cloud API');
//       }
//     } catch (error) {
//       console.error('Error registering for Cloud API:', error);
//       setError('An error occurred while registering for Cloud API');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render the current step of the registration process
//   const renderStep = () => {
//     switch (step) {
//       case 'checking':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Checking Phone Number Status</CardTitle>
//               <CardDescription>
//                 Retrieving your WhatsApp Business phone number information...
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="flex justify-center items-center">
//               <div className="text-center">
//                 <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
//                 <p>Please wait while we check your phone number status</p>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 'requirements':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Phone Number Requirements</CardTitle>
//               <CardDescription>
//                 Before registering a WhatsApp Business phone number, please review the requirements:
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ul className="space-y-2 text-sm">
//                 {PHONE_NUMBER_REQUIREMENTS.map((req, index) => (
//                   <li key={index} className="flex items-start">
//                     <CheckCircle className="mr-2 mt-1 h-4 w-4 text-green-500" />
//                     {req}
//                   </li>
//                 ))}
//               </ul>
//               <div className="flex space-x-2 mt-4">
//                 <Button variant="outline" onClick={handleCancel} className="w-1/2">
//                   Cancel
//                 </Button>
//                 <Button onClick={() => setStep('input')} className="w-1/2">
//                   Proceed to Registration
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 'input':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Register Phone Number</CardTitle>
//               <CardDescription>
//                 Enter your WhatsApp Business phone number details
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Error</AlertTitle>
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
//               <div>
//                 <Label htmlFor="country_code">Country Code</Label>
//                 <Input
//                   id="country_code"
//                   name="country_code"
//                   placeholder="1"
//                   value={formData.country_code}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="phone_number">Phone Number</Label>
//                 <Input
//                   id="phone_number"
//                   name="phone_number"
//                   placeholder="5551234567"
//                   value={formData.phone_number}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div>
//                 <Label htmlFor="verified_name">Business Name</Label>
//                 <Input
//                   id="verified_name"
//                   name="verified_name"
//                   placeholder="Your Business Name"
//                   value={formData.verified_name}
//                   onChange={handleInputChange}
//                 />
//               </div>
//               <div className="flex space-x-2">
//                 <Button variant="outline" onClick={() => setStep('requirements')} className="w-1/2">
//                   Back
//                 </Button>
//                 <Button onClick={registerPhoneNumber} disabled={isLoading} className="w-1/2">
//                   {isLoading ? 'Registering...' : 'Register Phone Number'}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 'verify-code':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Verify Phone Number</CardTitle>
//               <CardDescription>
//                 Enter the verification code sent to your phone number
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Error</AlertTitle>
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
//               <div>
//                 <Label htmlFor="verification_code">Verification Code</Label>
//                 <Input
//                   id="verification_code"
//                   placeholder="Enter 6-digit code"
//                   value={verificationCode}
//                   onChange={(e) => setVerificationCode(e.target.value)}
//                 />
//               </div>
//               <div className="flex space-x-2">
//                 <Button variant="outline" onClick={() => setStep('input')} className="w-1/2">
//                   Back
//                 </Button>
//                 <Button onClick={verifyPhoneNumber} disabled={isLoading} className="w-1/2">
//                   {isLoading ? 'Verifying...' : 'Verify Phone Number'}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 'two-factor':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Two-Factor Authentication</CardTitle>
//               <CardDescription>
//                 Two-factor authentication is enabled for this phone number
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>Error</AlertTitle>
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}
//               <div>
//                 <Label htmlFor="two_factor_pin">Two-Factor PIN</Label>
//                 <Input
//                   id="two_factor_pin"
//                   placeholder="Enter 6-digit PIN"
//                   value={twoFactorPin}
//                   onChange={(e) => setTwoFactorPin(e.target.value)}
//                 />
//               </div>
//               <div className="flex space-x-2">
//                 <Button variant="outline" onClick={() => setStep('verify-code')} className="w-1/2">
//                   Back
//                 </Button>
//                 <Button onClick={registerForCloudAPI} disabled={isLoading} className="w-1/2">
//                   {isLoading ? 'Registering...' : 'Register for Cloud API'}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       case 'cloud-api-registration':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Register for Cloud API</CardTitle>
//               <CardDescription>
//                 Complete registration for Cloud API integration
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col items-center">
//               <Button onClick={registerForCloudAPI} disabled={isLoading} className="w-full">
//                 {isLoading ? 'Registering...' : 'Register for Cloud API'}
//               </Button>
//             </CardContent>
//           </Card>
//         );

//       case 'complete':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Registration Complete</CardTitle>
//               <CardDescription>
//                 Your WhatsApp Business phone number is now registered for Cloud API
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col items-center">
//               <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
//               <p className="text-center mb-4">
//                 Congratulations! Your WhatsApp Business phone number is now fully integrated and ready to use.
//               </p>
//               <Button onClick={handleCancel} className="w-full">
//                 Return to WhatsApp Integration
//               </Button>
//             </CardContent>
//           </Card>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <div className="max-w-md mx-auto">
//         {renderStep()}
//       </div>
//     </div>
//   );
// }













// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// // API URL
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// // Phone number requirements interface
// interface WhatsAppPhoneNumberRegistrationProps {
//   onCancel?: () => void;
// }

// // Phone number requirements
// const PHONE_NUMBER_REQUIREMENTS = [
//   'Must be owned by you',
//   'Must have a country and area code',
//   'Cannot be a short code',
//   'Must be able to receive voice calls or SMS',
//   'Not already in use with WhatsApp Messenger or WhatsApp Business app',
//   'Not banned'
// ];

// export function WhatsAppPhoneNumberRegistration({ 
//   onCancel 
// }: WhatsAppPhoneNumberRegistrationProps) {
//   // Step states
//   const [step, setStep] = useState<
//     'checking' | 
//     'requirements' | 
//     'input' | 
//     'verify-code' | 
//     'two-factor' | 
//     'cloud-api-registration' | 
//     'complete'
//   >('checking');

//   // Form and state management
//   const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
//   const [formData, setFormData] = useState({
//     country_code: '',
//     phone_number: '',
//     verified_name: ''
//   });
//   const [verificationCode, setVerificationCode] = useState('');
//   const [twoFactorPin, setTwoFactorPin] = useState('');
//   const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   // Fetch existing phone numbers on component mount
//   useEffect(() => {
//     fetchPhoneNumbers();
//   }, []);

//   // Fetch phone numbers
//   const fetchPhoneNumbers = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in');
//         setStep('requirements');
//         return;
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/phone-numbers`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });

//       const result = await response.json();

//       if (result.status) {
//         setPhoneNumbers(result.data);
        
//         // Determine next step based on phone numbers
//         if (result.data.length === 0) {
//           setStep('requirements');
//         } else {
//           // Check verification status of first phone number
//           const firstNumber = result.data[0];
//           if (firstNumber.verification_status === 'NOT_VERIFIED') {
//             setSelectedPhoneNumber(firstNumber);
//             setStep('verify-code');
//           } else {
//             setStep('cloud-api-registration');
//           }
//         }
//       } else {
//         setError(result.msg || 'Failed to fetch phone numbers');
//         setStep('requirements');
//       }
//     } catch (error) {
//       console.error('Error fetching phone numbers:', error);
//       setError('An error occurred while fetching phone numbers');
//       setStep('requirements');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle cancel
//   const handleCancel = () => {
//     if (onCancel) {
//       onCancel();
//     } else {
//       router.push('/whatsapp');
//     }
//   };

//   // Request verification code
//   const requestVerificationCode = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in');
//         return;
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/request-verification-code`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           phone_number_id: selectedPhoneNumber.id
//         })
//       });

//       const result = await response.json();

//       if (result.status) {
//         setStep('verify-code');
//       } else {
//         setError(result.msg || 'Failed to request verification code');
//       }
//     } catch (error) {
//       console.error('Error requesting verification code:', error);
//       setError('An error occurred while requesting verification code');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Verify phone number
//   const verifyPhoneNumber = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in');
//         return;
//       }

//       const response = await fetch(`${API_URL}/whatsapp/verify-phone-number`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           phone_number_id: selectedPhoneNumber.id,
//           verification_code: verificationCode
//         })
//       });

//       const result = await response.json();

//       if (result.status) {
//         // Check 2FA status
//         if (result.data.two_factor_enabled) {
//           setStep('two-factor');
//         } else {
//           setStep('cloud-api-registration');
//         }
//       } else {
//         setError(result.msg || 'Failed to verify phone number');
//       }
//     } catch (error) {
//       console.error('Error verifying phone number:', error);
//       setError('An error occurred while verifying phone number');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Register for Cloud API
//   const registerForCloudAPI = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in');
//         return;
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/register-cloud-api`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           phone_number_id: selectedPhoneNumber.id,
//           two_factor_pin: twoFactorPin // Optional
//         })
//       });

//       const result = await response.json();

//       if (result.status) {
//         setStep('complete');
//       } else {
//         setError(result.msg || 'Failed to register for Cloud API');
//       }
//     } catch (error) {
//       console.error('Error registering for Cloud API:', error);
//       setError('An error occurred while registering for Cloud API');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render steps
//   const renderStep = () => {
//     switch (step) {
//       case 'checking':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Checking Phone Number Status</CardTitle>
//               <CardDescription>
//                 Retrieving your WhatsApp Business phone number information...
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="flex justify-center items-center">
//               <div className="text-center">
//                 <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
//                 <p>Please wait while we check your phone number status</p>
//               </div>
//             </CardContent>
//           </Card>
//         );

//       // Rest of the steps remain the same as in the previous implementation
//       // ... (include the previous implementation of other steps)

//       case 'complete':
//         return (
//           <Card>
//             <CardHeader>
//               <CardTitle>Registration Complete</CardTitle>
//               <CardDescription>
//                 Your WhatsApp Business phone number is now registered for Cloud API
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="flex flex-col items-center">
//               <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
//               <p className="text-center mb-4">
//                 Congratulations! Your WhatsApp Business phone number is now fully integrated and ready to use.
//               </p>
//               <Button onClick={handleCancel} className="w-full">
//                 Return to WhatsApp Integration
//               </Button>
//             </CardContent>
//           </Card>
//         );
//     }
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <div className="max-w-md mx-auto">
//         {renderStep()}
//       </div>
//     </div>
//   );
// }



// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// import { AlertCircle, CheckCircle } from 'lucide-react';

// // Phone number requirements interface
// interface WhatsAppPhoneNumberRegistrationProps {
//   onCancel?: () => void;
// }

// // Phone number requirements
// const PHONE_NUMBER_REQUIREMENTS = [
//   'Must be owned by you',
//   'Must have a country and area code',
//   'Cannot be a short code',
//   'Must be able to receive voice calls or SMS',
//   'Not already in use with WhatsApp Messenger or WhatsApp Business app',
//   'Not banned'
// ];

// export function WhatsAppPhoneNumberRegistration({ 
//   onCancel 
// }: WhatsAppPhoneNumberRegistrationProps) {
//   const [step, setStep] = useState<'requirements' | 'input' | 'verify'>('requirements');
//   const [formData, setFormData] = useState({
//     country_code: '',
//     phone_number: '',
//     verified_name: ''
//   });
//   const [verificationCode, setVerificationCode] = useState('');
//   const [phoneNumberId, setPhoneNumberId] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleCancel = () => {
//     if (onCancel) {
//       onCancel();
//     } else {
//       router.push('/whatsapp');
//     }
//   };

  // const registerPhoneNumber = async () => {
  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const token = localStorage.getItem('authToken');
      
  //     if (!token) {
  //       setError('You must be logged in to register a phone number');
  //       return;
  //     }

  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/register-phone-number`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({
  //         country_code: formData.country_code,
  //         phone_number: formData.phone_number,
  //         verified_name: formData.verified_name
  //       })
  //     });

  //     const result = await response.json();

  //     if (result.status) {
  //       setPhoneNumberId(result.data.phone_number_id);
  //       setStep('verify');
  //     } else {
  //       setError(result.msg || 'Failed to register phone number');
  //     }
  //   } catch (error) {
  //     console.error('Phone number registration error:', error);
  //     setError('An error occurred while registering the phone number');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

//   const verifyPhoneNumber = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('authToken');
      
//       if (!token) {
//         setError('You must be logged in to verify the phone number');
//         return;
//       }

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/verify-phone-number`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           phone_number_id: phoneNumberId,
//           verification_code: verificationCode
//         })
//       });

//       const result = await response.json();

//       if (result.status) {
//         // Verification successful
//         handleCancel(); // This will either call the onCancel prop or navigate back
//       } else {
//         setError(result.msg || 'Failed to verify phone number');
//       }
//     } catch (error) {
//       console.error('Phone number verification error:', error);
//       setError('An error occurred while verifying the phone number');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderStep = () => {
  //   switch (step) {
  //     case 'requirements':
  //       return (
  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Phone Number Requirements</CardTitle>
  //             <CardDescription>
  //               Before registering a WhatsApp Business phone number, please review the requirements:
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <ul className="space-y-2 text-sm">
  //               {PHONE_NUMBER_REQUIREMENTS.map((req, index) => (
  //                 <li key={index} className="flex items-start">
  //                   <CheckCircle className="mr-2 mt-1 h-4 w-4 text-green-500" />
  //                   {req}
  //                 </li>
  //               ))}
  //             </ul>
  //             <div className="flex space-x-2 mt-4">
  //               <Button 
  //                 variant="outline"
  //                 onClick={handleCancel} 
  //                 className="w-1/2"
  //               >
  //                 Cancel
  //               </Button>
  //               <Button 
  //                 onClick={() => setStep('input')} 
  //                 className="w-1/2"
  //               >
  //                 Proceed to Registration
  //               </Button>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       );

  //     case 'input':
  //       return (
  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Register Phone Number</CardTitle>
  //             <CardDescription>
  //               Enter your WhatsApp Business phone number details
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent className="space-y-4">
  //             {error && (
  //               <Alert variant="destructive">
  //                 <AlertCircle className="h-4 w-4" />
  //                 <AlertTitle>Error</AlertTitle>
  //                 <AlertDescription>{error}</AlertDescription>
  //               </Alert>
  //             )}
  //             <div>
  //               <Label htmlFor="country_code">Country Code</Label>
  //               <Input
  //                 id="country_code"
  //                 name="country_code"
  //                 placeholder="1"
  //                 value={formData.country_code}
  //                 onChange={handleInputChange}
  //               />
  //             </div>
  //             <div>
  //               <Label htmlFor="phone_number">Phone Number</Label>
  //               <Input
  //                 id="phone_number"
  //                 name="phone_number"
  //                 placeholder="5551234567"
  //                 value={formData.phone_number}
  //                 onChange={handleInputChange}
  //               />
  //             </div>
  //             <div>
  //               <Label htmlFor="verified_name">Business Name</Label>
  //               <Input
  //                 id="verified_name"
  //                 name="verified_name"
  //                 placeholder="Your Business Name"
  //                 value={formData.verified_name}
  //                 onChange={handleInputChange}
  //               />
  //             </div>
  //             <div className="flex space-x-2">
  //               <Button 
  //                 variant="outline"
  //                 onClick={() => setStep('requirements')} 
  //                 className="w-1/2"
  //               >
  //                 Back
  //               </Button>
  //               <Button 
  //                 onClick={registerPhoneNumber} 
  //                 disabled={isLoading}
  //                 className="w-1/2"
  //               >
  //                 {isLoading ? 'Registering...' : 'Register Phone Number'}
  //               </Button>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       );

  //     case 'verify':
  //       return (
  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Verify Phone Number</CardTitle>
  //             <CardDescription>
  //               Enter the verification code sent to your phone number
  //             </CardDescription>
  //           </CardHeader>
  //           <CardContent className="space-y-4">
  //             {error && (
  //               <Alert variant="destructive">
  //                 <AlertCircle className="h-4 w-4" />
  //                 <AlertTitle>Error</AlertTitle>
  //                 <AlertDescription>{error}</AlertDescription>
  //               </Alert>
  //             )}
  //             <div>
  //               <Label htmlFor="verification_code">Verification Code</Label>
  //               <Input
  //                 id="verification_code"
  //                 placeholder="Enter 6-digit code"
  //                 value={verificationCode}
  //                 onChange={(e) => setVerificationCode(e.target.value)}
  //               />
  //             </div>
  //             <div className="flex space-x-2">
  //               <Button 
  //                 variant="outline"
  //                 onClick={() => setStep('input')} 
  //                 className="w-1/2"
  //               >
  //                 Back
  //               </Button>
  //               <Button 
  //                 onClick={verifyPhoneNumber} 
  //                 disabled={isLoading}
  //                 className="w-1/2"
  //               >
  //                 {isLoading ? 'Verifying...' : 'Verify Phone Number'}
  //               </Button>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       );
  //   }
  // };

//   return (
//     <div className="container mx-auto py-8">
//       <div className="max-w-md mx-auto">
//         {renderStep()}
//       </div>
//     </div>
//   );
// }