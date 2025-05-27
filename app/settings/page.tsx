"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, ArrowLeft, Shield, Save, Trash2, LogOut } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [language, setLanguage] = useState("english")

  const handleSave = () => {
    setIsLoading(true)

    // Simulate saving settings
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
              <p className="text-muted-foreground">Customize your experience and manage your account</p>
            </div>
            <Button onClick={handleSave} disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          <Tabs defaultValue="appearance" className="mb-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="language">Language</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize how MindfulAI looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Theme</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Card
                        className={`cursor-pointer border-2 ${theme === "light" ? "border-primary" : "border-transparent"}`}
                        onClick={() => setTheme("light")}
                      >
                        <CardContent className="p-4 flex flex-col items-center gap-2">
                          <div className="w-full h-24 bg-white border rounded-md shadow-sm"></div>
                          <span className="text-sm font-medium">Light</span>
                        </CardContent>
                      </Card>
                      <Card
                        className={`cursor-pointer border-2 ${theme === "dark" ? "border-primary" : "border-transparent"}`}
                        onClick={() => setTheme("dark")}
                      >
                        <CardContent className="p-4 flex flex-col items-center gap-2">
                          <div className="w-full h-24 bg-slate-900 border rounded-md shadow-sm"></div>
                          <span className="text-sm font-medium">Dark</span>
                        </CardContent>
                      </Card>
                      <Card
                        className={`cursor-pointer border-2 ${theme === "system" ? "border-primary" : "border-transparent"}`}
                        onClick={() => setTheme("system")}
                      >
                        <CardContent className="p-4 flex flex-col items-center gap-2">
                          <div className="w-full h-24 bg-gradient-to-r from-white to-slate-900 border rounded-md shadow-sm"></div>
                          <span className="text-sm font-medium">System</span>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Chat Interface</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="compact-mode">Compact Mode</Label>
                          <p className="text-sm text-muted-foreground">Use a more compact chat interface</p>
                        </div>
                        <Switch id="compact-mode" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="message-timestamps">Show Message Timestamps</Label>
                          <p className="text-sm text-muted-foreground">Display time for each message</p>
                        </div>
                        <Switch id="message-timestamps" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="large-text">Larger Text</Label>
                          <p className="text-sm text-muted-foreground">Increase text size throughout the app</p>
                        </div>
                        <Switch id="large-text" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Control when and how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      defaultChecked
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="chat-reminders">Chat Reminders</Label>
                          <p className="text-sm text-muted-foreground">Reminders to continue conversations</p>
                        </div>
                        <Switch id="chat-reminders" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="mood-check-ins">Mood Check-ins</Label>
                          <p className="text-sm text-muted-foreground">Reminders to log your daily mood</p>
                        </div>
                        <Switch id="mood-check-ins" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="tips-insights">Tips & Insights</Label>
                          <p className="text-sm text-muted-foreground">Helpful mental wellness tips</p>
                        </div>
                        <Switch id="tips-insights" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="system-updates">System Updates</Label>
                          <p className="text-sm text-muted-foreground">Updates about new features</p>
                        </div>
                        <Switch id="system-updates" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="language" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Language Settings</CardTitle>
                  <CardDescription>Choose your preferred language</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language-select">Application Language</Label>
                        <select
                          id="language-select"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="english">English</option>
                          <option value="spanish">Español (Spanish)</option>
                          <option value="french">Français (French)</option>
                          <option value="german">Deutsch (German)</option>
                          <option value="chinese">中文 (Chinese)</option>
                          <option value="japanese">日本語 (Japanese)</option>
                          <option value="korean">한국어 (Korean)</option>
                        </select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">AI Response Language</h3>
                      <p className="text-sm text-muted-foreground">Choose the language for AI responses</p>

                      <div className="pt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="same-as-app"
                            name="ai-language"
                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                            defaultChecked
                          />
                          <Label htmlFor="same-as-app">Same as application language</Label>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="radio"
                            id="different-language"
                            name="ai-language"
                            className="h-4 w-4 border-primary text-primary focus:ring-primary"
                          />
                          <Label htmlFor="different-language">Use different language</Label>
                        </div>
                      </div>

                      <div className="pt-2">
                        <select
                          id="ai-language-select"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled
                        >
                          <option value="english">English</option>
                          <option value="spanish">Español (Spanish)</option>
                          <option value="french">Français (French)</option>
                          <option value="german">Deutsch (German)</option>
                          <option value="chinese">中文 (Chinese)</option>
                          <option value="japanese">日本語 (Japanese)</option>
                          <option value="korean">한국어 (Korean)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account and linked services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Linked Accounts</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <svg viewBox="0 0 24 24" width="24" height="24" className="h-6 w-6">
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
                          <div>
                            <p className="font-medium">Google</p>
                            <p className="text-sm text-muted-foreground">Connected as john.doe@gmail.com</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Disconnect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-blue-600"
                          >
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                          </svg>
                          <div>
                            <p className="font-medium">Facebook</p>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-blue-400"
                          >
                            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                          </svg>
                          <div>
                            <p className="font-medium">Twitter</p>
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Account Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Shield className="h-4 w-4" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <LogOut className="h-4 w-4" />
                        Sign Out from All Devices
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2 text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete Account
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

