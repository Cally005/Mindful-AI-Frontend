"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check Supabase config
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error("Missing Supabase configuration")
          router.push('/login?error=config')
          return
        }

        // Get code from URL
        const code = searchParams.get('code')
        const access_token = searchParams.get('access_token')
        const refresh_token = searchParams.get('refresh_token')

        // Create Supabase client
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        // If no code but we have tokens, try to use them
        if (!code && access_token) {
          // User might already be authenticated, try to get the session
          const { data: sessionData } = await supabase.auth.getSession()
          
          if (sessionData.session) {
            localStorage.setItem('session', JSON.stringify(sessionData.session))
            
            // Get user data from the session
            const { data: userData } = await supabase.auth.getUser()
            if (userData && userData.user) {
              localStorage.setItem('user', JSON.stringify(userData.user))
            }
            
            router.push('/chat')
            return
          }
          
          // Try to set session if we have an access token
          if (access_token) {
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: access_token,
              refresh_token: refresh_token || '',
            })
            
            if (!sessionError && sessionData.session) {
              localStorage.setItem('session', JSON.stringify(sessionData.session))
              
              // Get user data after setting the session
              const { data: userData } = await supabase.auth.getUser()
              if (userData && userData.user) {
                localStorage.setItem('user', JSON.stringify(userData.user))
              }
              
              router.push('/chat')
              return
            }
          }
        }

        // If we have a code, try to exchange it for a session
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (!error && data.session) {
            // Store session data
            localStorage.setItem('session', JSON.stringify(data.session))
            
            // Get user data
            const { data: userData } = await supabase.auth.getUser()
            if (userData && userData.user) {
              localStorage.setItem('user', JSON.stringify(userData.user))
            }
            
            // Redirect to dashboard
            router.push('/chat')
            return
          }
        }

        // If we get here, check if we already have a session anyway
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (sessionData.session) {
          // We already have a session, just redirect to dashboard
          router.push('/chat')
          return
        }

        // If we reached here, no authentication method worked
        router.push('/login?error=auth-failed')
        
      } catch (error) {
        console.error('Error handling auth callback:', error)
        router.push('/login?error=exception')
      }
    }

    handleCallback()
  }, [searchParams, router, supabaseUrl, supabaseAnonKey])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Completing authentication...</h2>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
      </div>
    </div>
  )
}