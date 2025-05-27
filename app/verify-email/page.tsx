"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, ArrowLeft, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast" 
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [email, setEmail] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [resendCooldown, setResendCooldown] = useState(0)
  



/*
* to do
1. timer before user can resend otp
2.

*/
  useEffect(() => {
    // Get the email from localStorage
    const storedEmail = localStorage.getItem("verificationEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // If no email is found, redirect to signup
      router.push("/signup")
    }
  }, [router])

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setTimeout(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
    
    if (value.length > 1) {
      value = value.slice(0, 1)
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  const resetOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    // Focus the first input
    const firstInput = document.getElementById('otp-0');
    if (firstInput) {
      firstInput.focus();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    // Check if all OTP fields are filled
    if (otp.some(digit => digit === "")) {
      setErrorMessage("Please enter all 6 digits of the verification code");
      setIsLoading(false);
      return;
    }

    // Combine OTP digits
    const otpValue = otp.join('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          token: otpValue
        })
      });
      
      const data = await response.json();
      
      if (data.status) {
        // Store the session token
        if (data.data?.session) {
          localStorage.setItem('session', JSON.stringify(data.data.session));
          
          // Get user data if available
          if (data.data.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
          }
        }
        
        toast({
          title: "Success",
          description: "Your email has been verified. Welcome to MindfulAI!",
        });
        
        // Clean up verification email
        localStorage.removeItem('verificationEmail');
        
        // Redirect to dashboard or chat
        router.push("/chat");
      } else {
        // Decrement attempts counter
        setAttemptsLeft(prev => Math.max(0, prev - 1));
        
        // Reset OTP fields
        resetOtp();
        
        // Display error message
        setErrorMessage(data.msg || "Invalid verification code. Please try again.");
        
        if (attemptsLeft <= 1) {
          toast({
            title: "Verification Failed",
            description: "You've used all your attempts. Please request a new code.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
      toast({
        title: "Error",
        description: "Failed to connect to verification service",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address is missing. Please go back to signup.",
        variant: "destructive"
      });
      return;
    }
    
    if (resendCooldown > 0) {
      toast({
        title: "Please wait",
        description: `You can request a new code in ${resendCooldown} seconds`,
      });
      return;
    }
    
    setIsResending(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      });
      
      const data = await response.json();
      
      if (data.status) {
        // Reset OTP fields and attempts
        resetOtp();
        setAttemptsLeft(3);
        
        // Set cooldown timer (60 seconds)
        setResendCooldown(60);
        
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email",
        });
      } else {
        toast({
          title: "Failed to Resend",
          description: data.msg || "Could not send a new verification code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
      toast({
        title: "Error",
        description: "Failed to connect to verification service",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <Link
        href="/signup"
        className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to signup
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-2xl font-semibold">MindfulAI</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification code to {email ? <span className="font-medium">{email}</span> : 'your email address'}. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    required
                  />
                ))}
              </div>
              {attemptsLeft < 3 && (
                <p className="text-xs text-amber-500 mt-2">
                  {attemptsLeft > 0 
                    ? `${attemptsLeft} verification ${attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining` 
                    : 'No verification attempts remaining. Please request a new code.'}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || attemptsLeft === 0}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Didn&apos;t receive a code?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-primary"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
            >
              {isResending 
                ? "Sending..." 
                : resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : "Resend code"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}






// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Brain, ArrowLeft } from "lucide-react"
// import { toast } from "@/components/ui/use-toast" // Import toast if available

// export default function VerifyEmailPage() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(false)
//   const [isResending, setIsResending] = useState(false)
//   const [otp, setOtp] = useState(["", "", "", "", "", ""])
//   const [email, setEmail] = useState("")
  
//   useEffect(() => {
//     // Get the email from localStorage
//     const storedEmail = localStorage.getItem("verificationEmail")
//     if (storedEmail) {
//       setEmail(storedEmail)
//     } else {
//       // If no email is found, redirect to signup
//       router.push("/signup")
//     }
//   }, [router])

//   const handleChange = (index: number, value: string) => {
//     if (value.length > 1) {
//       value = value.slice(0, 1)
//     }

//     const newOtp = [...otp]
//     newOtp[index] = value
//     setOtp(newOtp)

//     // Auto-focus next input
//     if (value && index < 5) {
//       const nextInput = document.getElementById(`otp-${index + 1}`)
//       if (nextInput) {
//         nextInput.focus()
//       }
//     }
//   }

//   const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
//     // Handle backspace to go to previous input
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       const prevInput = document.getElementById(`otp-${index - 1}`)
//       if (prevInput) {
//         prevInput.focus()
//       }
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     // Combine OTP digits
//     const otpValue = otp.join('')
    
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-otp`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           email,
//           token: otpValue
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.status) {
//         // Store the session token
//         if (data.data?.session) {
//           localStorage.setItem('session', JSON.stringify(data.data.session));
          
//           // Get user data if available
//           if (data.data.user) {
//             localStorage.setItem('user', JSON.stringify(data.data.user));
//           }
//         }
        
//         toast({
//           title: "Success",
//           description: "Your email has been verified. Welcome to MindfulAI!",
//         });
        
//         // Clean up verification email
//         localStorage.removeItem('verificationEmail');
        
//         // Redirect to dashboard or chat
//         router.push("/chat");
//       } else {
//         toast({
//           title: "Verification Failed",
//           description: data.msg || "Invalid verification code. Please try again.",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Verification error:", error);
//       toast({
//         title: "Error",
//         description: "Failed to connect to verification service",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   const handleResend = async () => {
//     if (!email) {
//       toast({
//         title: "Error",
//         description: "Email address is missing. Please go back to signup.",
//         variant: "destructive"
//       });
//       return;
//     }
    
//     setIsResending(true);

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-otp`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           email
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.status) {
//         toast({
//           title: "Code Sent",
//           description: "A new verification code has been sent to your email",
//         });
//       } else {
//         toast({
//           title: "Failed to Resend",
//           description: data.msg || "Could not send a new verification code",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Resend error:", error);
//       toast({
//         title: "Error",
//         description: "Failed to connect to verification service",
//         variant: "destructive"
//       });
//     } finally {
//       setIsResending(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
//       <Link
//         href="/signup"
//         className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//       >
//         <ArrowLeft className="h-4 w-4" />
//         Back to signup
//       </Link>

//       <div className="flex items-center gap-2 mb-8">
//         <Brain className="h-8 w-8 text-primary" />
//         <span className="text-2xl font-semibold">MindfulAI</span>
//       </div>

//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Verify your email</CardTitle>
//           <CardDescription>
//             We&apos;ve sent a verification code to {email ? <span className="font-medium">{email}</span> : 'your email address'}. Please enter it below.
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="flex justify-between gap-2">
//               {otp.map((digit, index) => (
//                 <Input
//                   key={index}
//                   id={`otp-${index}`}
//                   type="text"
//                   inputMode="numeric"
//                   pattern="[0-9]*"
//                   maxLength={1}
//                   className="w-12 h-12 text-center text-lg"
//                   value={digit}
//                   onChange={(e) => handleChange(index, e.target.value)}
//                   onKeyDown={(e) => handleKeyDown(index, e)}
//                   required
//                 />
//               ))}
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? "Verifying..." : "Verify Email"}
//             </Button>
//           </form>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-4">
//           <div className="text-sm text-center text-muted-foreground">
//             Didn&apos;t receive a code?{" "}
//             <Button 
//               variant="link" 
//               className="p-0 h-auto text-primary"
//               onClick={handleResend}
//               disabled={isResending}
//             >
//               {isResending ? "Sending..." : "Resend code"}
//             </Button>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }