"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle, ShieldCheck } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAdminSecret, setShowAdminSecret] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    adminSecret: ''
  })
  const [error, setError] = useState("")
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    // Get full URL including hash
    const fullUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    console.log("Full URL:", fullUrl);
    
    // Try standard query parameters first
    let resetToken = searchParams.get('token') || 
                     searchParams.get('access_token') || 
                     localStorage.getItem('adminResetToken');
    
    // If that doesn't work, try to extract from the full URL
    if (!resetToken && fullUrl) {
      const tokenMatch = fullUrl.match(/[?&#]token=([^&#]+)/);
      const accessTokenMatch = fullUrl.match(/[?&#]access_token=([^&#]+)/);
      const typeMatch = fullUrl.match(/[?&#]type=([^&#]+)/);
      
      // If the URL has type=recovery, this is definitely a password reset
      if (typeMatch && typeMatch[1] === 'recovery') {
        const extractedToken = tokenMatch ? tokenMatch[1] : 
                              (accessTokenMatch ? accessTokenMatch[1] : null);
        
        if (extractedToken) {
          console.log("Extracted token from URL:", extractedToken);
          resetToken = extractedToken;
        }
      }
    }
    
    // Regular processing of token
    if (resetToken) {
      setToken(resetToken);
      setIsTokenValid(true);
      localStorage.setItem('adminResetToken', resetToken);
    } else {
      setIsTokenValid(false);
      setError("Password reset token is missing. Please request a new password reset link.");
      
      toast({
        title: "Error",
        description: "Password reset token is missing. Please request a new password reset link.",
        variant: "destructive"
      });
      
      // Redirect to forgot password page after a delay
      setTimeout(() => {
        router.push('/admin/forgot-password');
      }, 3000);
    }
  }, [searchParams, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    
    // Clear error when user types
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    
    if (!token) {
      setError("Reset token is missing. Please request a new password reset.")
      return
    }
    
    if (!formData.adminSecret) {
      setError("Admin secret key is required")
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: formData.password,
          token: token,
          adminSecret: formData.adminSecret
        })
      });
      
      const data = await response.json();
      
      if (data.status) {
        // Password reset successful
        setIsSubmitted(true)
        
        // Clean up the token from localStorage
        localStorage.removeItem('adminResetToken')
        
        toast({
          title: "Success",
          description: "Your admin password has been successfully reset",
        });
      } else {
        setError(data.msg || "Failed to reset password. The link may have expired.");
        toast({
          title: "Error",
          description: data.msg || "Failed to reset password. The link may have expired.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Admin password reset error:", error);
      setError("Failed to connect to the server. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to connect to the server. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Link
        href="/admin/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin login
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-2xl font-semibold">MindfulAI</span>
        <ShieldCheck className="h-5 w-5 text-amber-500" />
        <span className="text-lg font-medium text-amber-500">Admin</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create new admin password</CardTitle>
          <CardDescription>Enter a new password for your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <CheckCircle className="h-12 w-12 text-primary" />
              <p className="text-center">Your admin password has been successfully reset.</p>
              <Button onClick={() => router.push("/admin/login")} className="mt-4">
                Sign in with new password
              </Button>
            </div>
          ) : (
            <>
              {isTokenValid === false ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Invalid or missing password reset token. Redirecting to password reset request page...
                  </AlertDescription>
                </Alert>
              ) : error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password}
                      onChange={handleChange}
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminSecret">Admin Secret Key</Label>
                  <div className="relative">
                    <Input 
                      id="adminSecret" 
                      type={showAdminSecret ? "text" : "password"}
                      value={formData.adminSecret}
                      onChange={handleChange}
                      required 
                      placeholder="Enter admin secret key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowAdminSecret(!showAdminSecret)}
                    >
                      {showAdminSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showAdminSecret ? "Hide secret" : "Show secret"}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Enter the admin secret key provided by your organization</p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !token || isTokenValid === false}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Admin Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}