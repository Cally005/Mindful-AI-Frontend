"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Brain, ArrowLeft, Upload, Save, LineChart, Calendar, Lock } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("John Doe")
  const [email, setEmail] = useState("john.doe@example.com")

  const handleSave = () => {
    setIsLoading(true)

    // Simulate saving profile
    setTimeout(() => {
      setIsLoading(false)
      // Show success message or redirect
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">MindfulAI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/resources" className="text-sm font-medium hover:text-primary">
              Resources
            </Link>
            <ModeToggle />
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/chat"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground mb-8">Manage your account details and preferences</p>

          <Tabs defaultValue="profile" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="mood-tracking">Mood Tracking</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                        <AvatarFallback className="text-2xl">JD</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Change Photo
                      </Button>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number (optional)</Label>
                        <Input id="phone" placeholder="Enter your phone number" />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your account settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value="johndoe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                      <option value="UTC-7">Mountain Time (UTC-7)</option>
                      <option value="UTC-6">Central Time (UTC-6)</option>
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                      <option value="UTC+0">UTC</option>
                      <option value="UTC+1">Central European Time (UTC+1)</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" className="text-destructive">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mood-tracking" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Tracking History</CardTitle>
                  <CardDescription>View your mood patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full flex items-center justify-center border rounded">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <LineChart className="h-8 w-8" />
                      <p>Your mood tracking visualization would appear here</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium">Recent Mood Entries</h3>
                    <div className="space-y-2">
                      {[
                        { date: "Today", mood: "Good", note: "Feeling productive and energetic" },
                        { date: "Yesterday", mood: "Okay", note: "Slightly anxious about work deadline" },
                        { date: "2 days ago", mood: "Great", note: "Had a wonderful day outdoors" },
                        { date: "3 days ago", mood: "Low", note: "Feeling tired and unmotivated" },
                        { date: "4 days ago", mood: "Okay", note: "Normal day, nothing special" },
                      ].map((entry, i) => (
                        <div key={i} className="flex items-center p-3 border rounded">
                          <div className="w-24 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            {entry.date}
                          </div>
                          <div className="w-20">
                            <Badge mood={entry.mood} />
                          </div>
                          <div className="flex-1 text-sm">{entry.note}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button variant="outline">View Full History</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Mood Tracking Settings</CardTitle>
                  <CardDescription>Customize your mood tracking experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily-reminder">Daily Mood Check-in Reminder</Label>
                      <p className="text-sm text-muted-foreground">Receive a daily reminder to log your mood</p>
                    </div>
                    <Switch id="daily-reminder" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Reminder Time</Label>
                    <Input id="reminder-time" type="time" defaultValue="20:00" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-insights">Weekly Mood Insights</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly insights about your mood patterns</p>
                    </div>
                    <Switch id="weekly-insights" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control your data and privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect usage data to improve your experience
                      </p>
                    </div>
                    <Switch id="data-collection" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="chat-history">Save Chat History</Label>
                      <p className="text-sm text-muted-foreground">Store your conversations for future reference</p>
                    </div>
                    <Switch id="chat-history" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="third-party">Third-party Data Sharing</Label>
                      <p className="text-sm text-muted-foreground">Share anonymized data with research partners</p>
                    </div>
                    <Switch id="third-party" />
                  </div>
                  <Separator />
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Data Management</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Lock className="h-4 w-4" />
                        Download My Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2 text-destructive">
                        <Lock className="h-4 w-4" />
                        Delete All My Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">MindfulAI</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact Us
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MindfulAI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Badge component for mood visualization
function Badge({ mood }: { mood: string }) {
  const getColor = () => {
    switch (mood.toLowerCase()) {
      case "great":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "okay":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "bad":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColor()}`}>
      {mood}
    </span>
  )
}

