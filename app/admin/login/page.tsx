"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield,  Eye, EyeOff, AlertCircle  } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
      email: '',
      password: ''
    })
  const [error, setError] = useState("")

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
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password }),
      })

      const data = await response.json();
      console.log("Login response data:", data);

      if (data.status) {
 
              // Store the access token from the session
      const accessToken = data.session?.access_token;
      if (accessToken) {
        localStorage.setItem('authToken', accessToken);
        console.log("Token stored in localStorage:", accessToken);
      }

      // Store full user object
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store session details
      localStorage.setItem('session', JSON.stringify(data.session));

      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
        
        setIsLoading(true)
        // Redirect to admin dashboard
      router.push("/admin/dashboard");
      } else {
        setError(data.msg || "Invalid email or password");
        toast({
          title: "Login Failed",
          description: data.msg || "Invalid email or password",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to connect to authentication service");
      toast({
        title: "Error",
        description: "Failed to connect to authentication service",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <span className="text-2xl font-semibold">MindfulAI Admin</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
        {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com"  value={formData.email}
                onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/admin/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"}  value={formData.password}
                onChange={handleChange} required />
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
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (<>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Protected admin area. Unauthorized access is prohibited.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

