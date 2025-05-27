"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Save, Key, Shield, Bell, MessageSquare, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("sk-••••••••••••••••••••••••••••••")
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)

    // Simulate saving settings
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <Button onClick={handleSave} disabled={isLoading} className="gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="MindfulAI" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" defaultValue="support@mindfulai.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy-policy">Privacy Policy URL</Label>
                <Input id="privacy-policy" defaultValue="https://mindfulai.com/privacy" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Terms of Service URL</Label>
                <Input id="terms" defaultValue="https://mindfulai.com/terms" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Temporarily disable the application for maintenance</p>
                </div>
                <Switch id="maintenance-mode" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <Input id="openai-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" />
                  <Button variant="outline" className="shrink-0">
                    <Key className="h-4 w-4 mr-2" />
                    Reveal
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Used for AI model access. Keep this key secure.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="analytics-key">Analytics API Key</Label>
                <div className="flex gap-2">
                  <Input id="analytics-key" defaultValue="ana-••••••••••••••••••••••••••••••" type="password" />
                  <Button variant="outline" className="shrink-0">
                    <Key className="h-4 w-4 mr-2" />
                    Reveal
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage-key">Storage API Key</Label>
                <div className="flex gap-2">
                  <Input id="storage-key" defaultValue="sto-••••••••••••••••••••••••••••••" type="password" />
                  <Button variant="outline" className="shrink-0">
                    <Key className="h-4 w-4 mr-2" />
                    Reveal
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="gap-2">
                <Key className="h-4 w-4" />
                Generate New Keys
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                </div>
                <Switch id="two-factor" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">Automatically log out inactive admin users</p>
                </div>
                <Switch id="session-timeout" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout-duration">Timeout Duration (minutes)</Label>
                <Input id="timeout-duration" defaultValue="30" type="number" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ip-restriction">IP Restriction</Label>
                  <p className="text-sm text-muted-foreground">Limit admin access to specific IP addresses</p>
                </div>
                <Switch id="ip-restriction" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                <Textarea id="allowed-ips" placeholder="Enter IP addresses, one per line" className="min-h-[100px]" />
                <p className="text-sm text-muted-foreground">Leave empty to allow all IP addresses</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Security Audit Log
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure alerts and notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="crisis-alerts">Crisis Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for crisis situations</p>
                </div>
                <Switch id="crisis-alerts" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crisis-email">Crisis Alert Email Recipients</Label>
                <Input id="crisis-email" defaultValue="crisis-team@mindfulai.com, support@mindfulai.com" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-alerts">System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for system issues</p>
                </div>
                <Switch id="system-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="user-reports">User Reports</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for user-reported issues</p>
                </div>
                <Switch id="user-reports" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-summary">Weekly Summary</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly usage and analytics summary</p>
                </div>
                <Switch id="weekly-summary" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="gap-2">
                <Bell className="h-4 w-4" />
                Test Notifications
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Settings</CardTitle>
              <CardDescription>Configure AI behavior and response parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-model">AI Model</Label>
                <select
                  id="ai-model"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  className="min-h-[150px]"
                  defaultValue="You are MindfulAI, a compassionate mental health assistant. Respond with empathy and helpful advice. Keep responses concise and supportive. Never claim to be a replacement for professional mental health care. If someone is in crisis, suggest professional help or emergency services."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.7"
                    className="w-full"
                  />
                  <span className="w-12 text-center">0.7</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Controls randomness: 0 is deterministic, 1 is more creative
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="crisis-detection">Crisis Detection</Label>
                  <p className="text-sm text-muted-foreground">Automatically detect and flag crisis situations</p>
                </div>
                <Switch id="crisis-detection" defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crisis-keywords">Crisis Keywords</Label>
                <Textarea
                  id="crisis-keywords"
                  className="min-h-[100px]"
                  defaultValue="suicide, kill myself, end my life, self-harm, hurt myself, don't want to live"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crisis-response">Crisis Response Template</Label>
                <Textarea
                  id="crisis-response"
                  className="min-h-[150px]"
                  defaultValue="I'm concerned about what you're sharing. If you're in immediate danger, please call emergency services at 911 or the National Suicide Prevention Lifeline at 1-800-273-8255. They have trained counselors available 24/7. Would you like me to provide more resources that might help?"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Test Chatbot
              </Button>
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Test Crisis Detection
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

