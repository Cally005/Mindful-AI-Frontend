"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { User, Settings, LifeBuoy, LogOut } from "lucide-react"
import { getAuthToken } from "@/utils/auth"

export function UserNav() {
  const router = useRouter()
  const [userData, setUserData] = useState({
    name: "John Doe", // Default value
    email: "john.doe@example.com", // Default value
    avatarUrl: "/placeholder.svg?height=32&width=32" // Default value
  })

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        // Check if we have user data in localStorage
        const userStr = localStorage.getItem('user')
        console.log("User data from localStorage:", userStr)
        
        if (userStr) {
          const userData = JSON.parse(userStr)
          console.log("Parsed user data:", userData)
          
          // Extract the user metadata from the structure
          const userMetadata = userData.user_metadata || userData.app_metadata || {}
          console.log("User metadata:", userMetadata)
          
          setUserData({
            name: userMetadata.full_name || userMetadata.name || userData.name || "John Doe",
            email: userData.email || "john.doe@example.com",
            avatarUrl: userMetadata.avatar_url || "/placeholder.svg?height=32&width=32"
          })
          
          console.log("Updated user state:", {
            name: userMetadata.full_name || userMetadata.name || userData.name || "John Doe",
            email: userData.email || "john.doe@example.com",
            avatarUrl: userMetadata.avatar_url || "/placeholder.svg?height=32&width=32"
          })
        } else {
          console.log("No user data in localStorage, trying API")
          // Try to fetch user data from API if no user in localStorage
          const token = getAuthToken()
          console.log("Auth token:", token ? "Present" : "Missing")
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/current-user`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
            }
          })

          const data = await response.json()
          console.log("API response data:", data)
          
          if (data.status && data.data) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.data.user))
            console.log("API user data stored in localStorage")
            
            const userMetadata = data.data.user.user_metadata || data.data.user.app_metadata || {}
            console.log("API user metadata:", userMetadata)
            
            setUserData({
              name: userMetadata.full_name || userMetadata.name || data.data.user.name || "John Doe",
              email: data.data.user.email || "john.doe@example.com",
              avatarUrl: userMetadata.avatar_url || "/placeholder.svg?height=32&width=32"
            })
            
            console.log("Updated user state from API:", {
              name: userMetadata.full_name || userMetadata.name || data.data.user.name || "John Doe",
              email: data.data.user.email || "john.doe@example.com",
              avatarUrl: userMetadata.avatar_url || "/placeholder.svg?height=32&width=32"
            })
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        // Keep default values on error
      }
    }

    fetchUserData()
  }, [])

  // Generate initials from user name for avatar fallback
  const getInitials = (name: string) => {
    console.log("Generating initials for:", name)
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleLogOut = async () => {
    console.log("Logging out...")
    try {
      const token = getAuthToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const data = await response.json();
      console.log("Logout response:", data)

      if (data.status) {
        // Clear all authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        console.log("Cleared localStorage")
        
        router.push("/login");
      } else {
        console.error("Logout failed:", data.msg);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear localStorage even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('session');
      console.log("Cleared localStorage after error")
      
      router.push("/login");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData.avatarUrl} alt={userData.name} />
            <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/support")}>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


// "use client"

// import { useEffect, useState } from "react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuGroup,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { useRouter } from "next/navigation"
// import { User, Settings, LifeBuoy, LogOut } from "lucide-react"

// export function UserNav() {
//   const router = useRouter()
//   const [userData, setUserData] = useState({
//     name: "John Doe", // Default value
//     email: "john.doe@example.com", // Default value
//     avatarUrl: "/placeholder.svg?height=32&width=32" // Default value
//   })

//   useEffect(() => {
//     // Fetch user data when component mounts
//     const fetchUserData = async () => {
//       try {
//         // Check if we have session data in localStorage
//         const sessionData = localStorage.getItem('session')
        
//         if (sessionData) {
//           const parsedData = JSON.parse(sessionData)
          
//           // Update user data with values from session if available
//           setUserData({
//             name: parsedData.user?.user_metadata?.full_name || parsedData.user?.user_metadata?.name || "John Doe",
//             email: parsedData.user?.email || "john.doe@example.com",
//             avatarUrl: parsedData.user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"
//           })
//         } else {
//           // Try to fetch user data from API if no session in localStorage
//           const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/current-user`, {
//             method: 'GET',
//             headers: {
//               'Content-Type': 'application/json'
//             }
//           })

//           const data = await response.json()
          
//           if (data.status && data.session) {
//             setUserData({
//               name: data.session.user?.user_metadata?.full_name || data.session.user?.user_metadata?.name || "John Doe",
//               email: data.session.user?.email || "john.doe@example.com",
//               avatarUrl: data.session.user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"
//             })
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error)
//         // Keep default values on error
//       }
//     }

//     fetchUserData()
//   }, [])

//   // Generate initials from user name for avatar fallback
//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(part => part[0])
//       .join('')
//       .toUpperCase()
//       .substring(0, 2)
//   }

//   const handleLogOut = async () => {
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });

//       const data = await response.json();

//       if (data.status) {
//         localStorage.removeItem('session');
//         router.push("/login");
//       } else {
//         console.error("Logout failed:", data.msg);
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//           <Avatar className="h-8 w-8">
//             <AvatarImage src={userData.avatarUrl} alt={userData.name} />
//             <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
//           </Avatar>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent className="w-56" align="end" forceMount>
//         <DropdownMenuLabel className="font-normal">
//           <div className="flex flex-col space-y-1">
//             <p className="text-sm font-medium leading-none">{userData.name}</p>
//             <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
//           </div>
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuGroup>
//           <DropdownMenuItem onClick={() => router.push("/profile")}>
//             <User className="mr-2 h-4 w-4" />
//             <span>Profile</span>
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => router.push("/settings")}>
//             <Settings className="mr-2 h-4 w-4" />
//             <span>Settings</span>
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => router.push("/support")}>
//             <LifeBuoy className="mr-2 h-4 w-4" />
//             <span>Support</span>
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem onClick={handleLogOut}>
//           <LogOut className="mr-2 h-4 w-4" />
//           <span>Log out</span>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   )
// }