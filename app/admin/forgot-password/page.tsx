// app/admin/forgot-password/page.tsx

"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, ArrowLeft, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/admin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.status) {
        setIsSubmitted(true)
        toast({
          title: "Email Sent",
          description: "If your email is registered as an admin, you'll receive instructions to reset your password.",
        });
      } else {
        setError(data.msg || "Failed to send password reset email");
        toast({
          title: "Error",
          description: data.msg || "Failed to send password reset email",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Admin password reset request error:", error);
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
          <CardTitle className="text-2xl">Reset admin password</CardTitle>
          <CardDescription>
            Enter your admin email address and we&apos;ll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <CheckCircle className="h-12 w-12 text-primary" />
              <p className="text-center">
                If your email is registered as an admin, we&apos;ve sent you instructions to reset your password.
              </p>
              <Button onClick={() => router.push("/admin/login")} className="mt-4">
                Return to admin login
              </Button>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@example.com" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError("")
                    }}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>
        {!isSubmitted && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link href="/admin/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}