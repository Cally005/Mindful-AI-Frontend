"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect } from "react"

// Force dynamic rendering to avoid pre-rendering issues
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState("")

  // Check for error parameters from the callback page
  useEffect(() => {
    const errorType = searchParams.get('error')
    if (errorType) {
      switch (errorType) {
        case 'auth-failed':
          setError("Authentication failed. Please try again.")
          break
        case 'config':
          setError("Authentication system configuration error. Please contact support.")
          break
        case 'exception':
          setError("An error occurred during authentication. Please try again.")
          break
        default:
          setError("Authentication error. Please try again.")
      }

      toast({
        title: "Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive"
      })
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    
    // Clear error when user types
    if (error) setError("")
  }

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setError("")
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status && data.data?.url) {
        // Redirect to Google OAuth
        // The redirect URL will bring the user back to our callback page
        window.location.href = data.data.url;
      } else {
        setError(data.msg || "Failed to initiate Google sign-in")
        toast({
          title: "Error",
          description: data.msg || "Failed to initiate Google sign-in",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to connect to authentication service")
      toast({
        title: "Error",
        description: "Failed to connect to authentication service",
        variant: "destructive"
      });
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await response.json();
      console.log("Login response data:", data);

      if (data.status) {
        try {
          // Store the access token from the session
          if (data.data.session && data.data.session.access_token) {
            localStorage.setItem('authToken', data.data.session.access_token);
            console.log("Token stored in localStorage:", data.data.session.access_token);
          } else {
            console.error("No access token found in response");
          }

          // Store full user object
          if (data.data.user) {
            localStorage.setItem('user', JSON.stringify(data.data.user));
            console.log("User data stored in localStorage");
          } else {
            console.error("No user data found in response");
          }
          
          // Store session details
          if (data.data.session) {
            localStorage.setItem('session', JSON.stringify(data.data.session));
            console.log("Session data stored in localStorage");
          } else {
            console.error("No session data found in response");
          }

          // Check localStorage to confirm data was saved
          setTimeout(() => {
            console.log("Checking localStorage after save:");
            console.log("authToken:", localStorage.getItem('authToken') ? "Present" : "Missing");
            console.log("user:", localStorage.getItem('user') ? "Present" : "Missing");
            console.log("session:", localStorage.getItem('session') ? "Present" : "Missing");
          }, 100);

          toast({
            title: "Success",
            description: "You have successfully logged in",
          });
      
          // Redirect to chat
          router.push("/chat");
        } catch (storageError) {
          console.error("Error storing auth data:", storageError);
          
          // Still redirect even if storage fails
          toast({
            title: "Success",
            description: "You have successfully logged in, but some session data couldn't be stored.",
          });
          
          router.push("/chat");
        }
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
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-2xl font-semibold">MindfulAI</span>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue your mental health journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Google Sign-in Button */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            type="button"
          >
            {isGoogleLoading ? (
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    fill="#4285F4"
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                  />
                  <path
                    fill="#34A853"
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                  />
                </g>
              </svg>
            )}
            {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
          </Button>

          <div className="flex items-center gap-2 my-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
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
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

// search paramqters are used to handle errors from the callback page
// "use client"

// import type React from "react"
// import { useState } from "react"
// import Link from "next/link"
// import { useRouter, useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Brain, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
// import { Separator } from "@/components/ui/separator"
// import { toast } from "@/components/ui/use-toast"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useEffect } from "react"

// export default function LoginPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [isLoading, setIsLoading] = useState(false)
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   })
//   const [error, setError] = useState("")

//   // Check for error parameters from the callback page
//   useEffect(() => {
//     const errorType = searchParams.get('error')
//     if (errorType) {
//       switch (errorType) {
//         case 'auth-failed':
//           setError("Authentication failed. Please try again.")
//           break
//         case 'config':
//           setError("Authentication system configuration error. Please contact support.")
//           break
//         case 'exception':
//           setError("An error occurred during authentication. Please try again.")
//           break
//         default:
//           setError("Authentication error. Please try again.")
//       }

//       toast({
//         title: "Error",
//         description: "Authentication failed. Please try again.",
//         variant: "destructive"
//       })
//     }
//   }, [searchParams])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [id]: value
//     }))
    
//     // Clear error when user types
//     if (error) setError("")
//   }

//   // Handle Google Sign-in
//   const handleGoogleSignIn = async () => {
//     try {
//       setIsGoogleLoading(true)
//       setError("")
      
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
      
//       const data = await response.json();
      
//       if (data.status && data.data?.url) {
//         // Redirect to Google OAuth
//         // The redirect URL will bring the user back to our callback page
//         window.location.href = data.data.url;
//       } else {
//         setError(data.msg || "Failed to initiate Google sign-in")
//         toast({
//           title: "Error",
//           description: data.msg || "Failed to initiate Google sign-in",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Google sign-in error:", error);
//       setError("Failed to connect to authentication service")
//       toast({
//         title: "Error",
//         description: "Failed to connect to authentication service",
//         variant: "destructive"
//       });
//     } finally {
//       setIsGoogleLoading(false)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password
//         })
//       });
      
//       const data = await response.json();
//       console.log("Login response data:", data);

//       if (data.status) {
//         try {
//           // Store the access token from the session
//           if (data.data.session && data.data.session.access_token) {
//             localStorage.setItem('authToken', data.data.session.access_token);
//             console.log("Token stored in localStorage:", data.data.session.access_token);
//           } else {
//             console.error("No access token found in response");
//           }

//           // Store full user object
//           if (data.data.user) {
//             localStorage.setItem('user', JSON.stringify(data.data.user));
//             console.log("User data stored in localStorage");
//           } else {
//             console.error("No user data found in response");
//           }
          
//           // Store session details
//           if (data.data.session) {
//             localStorage.setItem('session', JSON.stringify(data.data.session));
//             console.log("Session data stored in localStorage");
//           } else {
//             console.error("No session data found in response");
//           }

//           // Check localStorage to confirm data was saved
//           setTimeout(() => {
//             console.log("Checking localStorage after save:");
//             console.log("authToken:", localStorage.getItem('authToken') ? "Present" : "Missing");
//             console.log("user:", localStorage.getItem('user') ? "Present" : "Missing");
//             console.log("session:", localStorage.getItem('session') ? "Present" : "Missing");
//           }, 100);

//           toast({
//             title: "Success",
//             description: "You have successfully logged in",
//           });
      
//           // Redirect to chat
//           router.push("/chat");
//         } catch (storageError) {
//           console.error("Error storing auth data:", storageError);
          
//           // Still redirect even if storage fails
//           toast({
//             title: "Success",
//             description: "You have successfully logged in, but some session data couldn't be stored.",
//           });
          
//           router.push("/chat");
//         }
//       } else {
//         setError(data.msg || "Invalid email or password");
//         toast({
//           title: "Login Failed",
//           description: data.msg || "Invalid email or password",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setError("Failed to connect to authentication service");
//       toast({
//         title: "Error",
//         description: "Failed to connect to authentication service",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
//       <Link
//         href="/"
//         className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//       >
//         <ArrowLeft className="h-4 w-4" />
//         Back to home
//       </Link>

//       <div className="flex items-center gap-2 mb-8">
//         <Brain className="h-8 w-8 text-primary" />
//         <span className="text-2xl font-semibold">MindfulAI</span>
//       </div>

//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Welcome back</CardTitle>
//           <CardDescription>Sign in to your account to continue your mental health journey</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
          
//           {/* Google Sign-in Button */}
//           <Button
//             variant="outline"
//             className="w-full flex items-center justify-center gap-2"
//             onClick={handleGoogleSignIn}
//             disabled={isGoogleLoading || isLoading}
//             type="button"
//           >
//             {isGoogleLoading ? (
//               <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
//             ) : (
//               <svg viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
//                 <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
//                   <path
//                     fill="#4285F4"
//                     d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
//                   />
//                   <path
//                     fill="#34A853"
//                     d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
//                   />
//                   <path
//                     fill="#FBBC05"
//                     d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
//                   />
//                   <path
//                     fill="#EA4335"
//                     d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
//                   />
//                 </g>
//               </svg>
//             )}
//             {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
//           </Button>

//           <div className="flex items-center gap-2 my-4">
//             <Separator className="flex-1" />
//             <span className="text-xs text-muted-foreground">OR</span>
//             <Separator className="flex-1" />
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input 
//                 id="email" 
//                 type="email" 
//                 placeholder="name@example.com" 
//                 required 
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled={isLoading}
//               />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link href="/forgot-password" className="text-xs text-primary hover:underline">
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <Input 
//                   id="password" 
//                   type={showPassword ? "text" : "password"} 
//                   required 
//                   value={formData.password}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                   <span className="sr-only">
//                     {showPassword ? "Hide password" : "Show password"}
//                   </span>
//                 </Button>
//               </div>
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
//                   Logging in...
//                 </>
//               ) : (
//                 "Log in"
//               )}
//             </Button>
//           </form>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-4">
//           <div className="text-sm text-center text-muted-foreground">
//             Don&apos;t have an account?{" "}
//             <Link href="/signup" className="text-primary hover:underline">
//               Sign up
//             </Link>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }

// "use client"

// import type React from "react"
// import { useState } from "react"
// import Link from "next/link"
// import { useRouter, useSearchParams } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Brain, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react"
// import { Separator } from "@/components/ui/separator"
// import { toast } from "@/components/ui/use-toast"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { useEffect } from "react"

// export default function LoginPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [isLoading, setIsLoading] = useState(false)
//   const [isGoogleLoading, setIsGoogleLoading] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   })
//   const [error, setError] = useState("")

//   // Check for error parameters from the callback page
//   useEffect(() => {
//     const errorType = searchParams.get('error')
//     if (errorType) {
//       switch (errorType) {
//         case 'auth-failed':
//           setError("Authentication failed. Please try again.")
//           break
//         case 'config':
//           setError("Authentication system configuration error. Please contact support.")
//           break
//         case 'exception':
//           setError("An error occurred during authentication. Please try again.")
//           break
//         default:
//           setError("Authentication error. Please try again.")
//       }

//       toast({
//         title: "Error",
//         description: "Authentication failed. Please try again.",
//         variant: "destructive"
//       })
//     }
//   }, [searchParams])

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target
//     setFormData(prev => ({
//       ...prev,
//       [id]: value
//     }))
    
//     // Clear error when user types
//     if (error) setError("")
//   }

//   // Handle Google Sign-in
//   const handleGoogleSignIn = async () => {
//     try {
//       setIsGoogleLoading(true)
//       setError("")
      
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
      
//       const data = await response.json();
      
//       if (data.status && data.data?.url) {
//         // Redirect to Google OAuth
//         // The redirect URL will bring the user back to our callback page
//         window.location.href = data.data.url;
//       } else {
//         setError(data.msg || "Failed to initiate Google sign-in")
//         toast({
//           title: "Error",
//           description: data.msg || "Failed to initiate Google sign-in",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Google sign-in error:", error);
//       setError("Failed to connect to authentication service")
//       toast({
//         title: "Error",
//         description: "Failed to connect to authentication service",
//         variant: "destructive"
//       });
//     } finally {
//       setIsGoogleLoading(false)
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           email: formData.email,
//           password: formData.password
//         })
//       });
      
//       const data = await response.json();
//       console.log("Login response data:", data);

//       if (data.status) {
 
//               // Store the access token from the session
//       const accessToken = data.session?.access_token;
//       if (accessToken) {
//         localStorage.setItem('authToken', accessToken);
//         console.log("Token stored in localStorage:", accessToken);
//       }

//       // Store full user object
//       localStorage.setItem('user', JSON.stringify(data.user));
      
//       // Store session details
//       localStorage.setItem('session', JSON.stringify(data.session))

//         toast({
//           title: "Success",
//           description: "You have successfully logged in",
//         });
    
//         // Redirect to chat
//         router.push("/chat");
//       } else {
//         setError(data.msg || "Invalid email or password");
//         toast({
//           title: "Login Failed",
//           description: data.msg || "Invalid email or password",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setError("Failed to connect to authentication service");
//       toast({
//         title: "Error",
//         description: "Failed to connect to authentication service",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
//       <Link
//         href="/"
//         className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//       >
//         <ArrowLeft className="h-4 w-4" />
//         Back to home
//       </Link>

//       <div className="flex items-center gap-2 mb-8">
//         <Brain className="h-8 w-8 text-primary" />
//         <span className="text-2xl font-semibold">MindfulAI</span>
//       </div>

//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Welcome back</CardTitle>
//           <CardDescription>Sign in to your account to continue your mental health journey</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {error && (
//             <Alert variant="destructive">
//               <AlertCircle className="h-4 w-4" />
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
          
//           {/* Google Sign-in Button */}
//           <Button
//             variant="outline"
//             className="w-full flex items-center justify-center gap-2"
//             onClick={handleGoogleSignIn}
//             disabled={isGoogleLoading || isLoading}
//             type="button"
//           >
//             {isGoogleLoading ? (
//               <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
//             ) : (
//               <svg viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
//                 <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
//                   <path
//                     fill="#4285F4"
//                     d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
//                   />
//                   <path
//                     fill="#34A853"
//                     d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
//                   />
//                   <path
//                     fill="#FBBC05"
//                     d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
//                   />
//                   <path
//                     fill="#EA4335"
//                     d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
//                   />
//                 </g>
//               </svg>
//             )}
//             {isGoogleLoading ? "Connecting..." : "Sign in with Google"}
//           </Button>

//           <div className="flex items-center gap-2 my-4">
//             <Separator className="flex-1" />
//             <span className="text-xs text-muted-foreground">OR</span>
//             <Separator className="flex-1" />
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input 
//                 id="email" 
//                 type="email" 
//                 placeholder="name@example.com" 
//                 required 
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled={isLoading}
//               />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link href="/forgot-password" className="text-xs text-primary hover:underline">
//                   Forgot password?
//                 </Link>
//               </div>
//               <div className="relative">
//                 <Input 
//                   id="password" 
//                   type={showPassword ? "text" : "password"} 
//                   required 
//                   value={formData.password}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                   <span className="sr-only">
//                     {showPassword ? "Hide password" : "Show password"}
//                   </span>
//                 </Button>
//               </div>
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
//                   Logging in...
//                 </>
//               ) : (
//                 "Log in"
//               )}
//             </Button>
//           </form>
//         </CardContent>
//         <CardFooter className="flex flex-col space-y-4">
//           <div className="text-sm text-center text-muted-foreground">
//             Don&apos;t have an account?{" "}
//             <Link href="/signup" className="text-primary hover:underline">
//               Sign up
//             </Link>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }