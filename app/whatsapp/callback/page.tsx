// app/whatsapp/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// Define API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WhatsAppCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const handleIntegration = async () => {
      // Extract access token from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const error = params.get('error');

      // Handle error scenario
      if (error) {
        setStatus('error');
        setErrorMessage('Authorization was cancelled or failed');
        return;
      }

      if (accessToken) {
        // Clear the hash from the URL
        window.history.replaceState(
          {}, 
          document.title, 
          window.location.pathname + window.location.search
        );

        try {
          // Retrieve authentication token
          let authToken = localStorage.getItem('authToken') || 
                          sessionStorage.getItem('authToken') || 
                          document.cookie.includes('authToken');
          
          // If no token found, attempt to redirect to login
          if (!authToken) {
            // If you have a login page, redirect there
            router.push('/login');
            return;
          }

          // Ensure authToken is a string
          authToken = authToken ?? localStorage.getItem('token') ?? '';

          if (!authToken) {
            throw new Error('No valid authentication token found');
          }
          // Send access token to backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/complete-token-integration`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ access_token: accessToken  })
          });

          const result = await response.json();

          if (result.status) {
            // Integration successful
            setStatus('success');
            
            // Redirect to main WhatsApp page after a short delay
            setTimeout(() => {
              router.push('/whatsapp');
            }, 2000);
          } else {
            // Handle integration failure
            setStatus('error');
            setErrorMessage(result.msg || 'WhatsApp integration failed');
          }
        } catch (error) {
          // Handle network or other errors
          console.error('WhatsApp integration error:', error);
          setStatus('error');
          setErrorMessage(error instanceof Error ? error.message : 'Failed to complete WhatsApp integration');
        }
      } else {
        // No access token found
        setStatus('error');
        setErrorMessage('No access token found');
      }
    };

    handleIntegration();
  }, [router]);
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        {status === 'loading' && (
          <Card>
            <CardHeader>
              <CardTitle>Processing WhatsApp Integration</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p>Completing WhatsApp authorization...</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {status === 'error' && (
          <Card>
            <CardHeader>
              <CardTitle>Integration Error</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-red-600 text-center">{errorMessage}</p>
              <button 
                onClick={() => router.push('/whatsapp')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Back to WhatsApp Integration
              </button>
            </CardContent>
          </Card>
        )}
        
        {status === 'success' && (
          <Card>
            <CardHeader>
              <CardTitle>Integration Successful</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <CheckCircle2 className="h-8 w-8 text-green-500 mb-4" />
              <p className="text-green-600 text-center">WhatsApp account successfully connected</p>
              <p className="text-muted-foreground text-sm mt-2">
                Redirecting to WhatsApp integration page...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}