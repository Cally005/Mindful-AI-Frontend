import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, MessageSquare, AlertTriangle, TrendingUp, Clock, Activity } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">324</div>
                <p className="text-xs text-muted-foreground">+18% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crisis Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">-3 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily active users over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full flex items-end justify-between gap-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const height = Math.floor(Math.random() * 100) + 20
                    return <div key={i} className="bg-primary/90 rounded-t w-full" style={{ height: `${height}px` }} />
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Conversation Topics</CardTitle>
                <CardDescription>Most discussed topics this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Anxiety", value: 34 },
                    { name: "Depression", value: 28 },
                    { name: "Sleep Issues", value: 16 },
                    { name: "Stress Management", value: 12 },
                    { name: "Relationships", value: 10 },
                  ].map((topic) => (
                    <div key={topic.name} className="flex items-center">
                      <div className="w-1/3 font-medium">{topic.name}</div>
                      <div className="w-2/3 flex items-center gap-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: `${topic.value * 2}%` }} />
                        <span className="text-sm text-muted-foreground">{topic.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>New users in the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Sarah Johnson", time: "2 hours ago" },
                    { name: "Michael Chen", time: "5 hours ago" },
                    { name: "Emma Williams", time: "8 hours ago" },
                    { name: "David Kim", time: "12 hours ago" },
                    { name: "Olivia Martinez", time: "18 hours ago" },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>{user.name}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{user.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "API Response Time", value: "124ms", status: "good" },
                    { name: "Database Load", value: "28%", status: "good" },
                    { name: "Memory Usage", value: "64%", status: "warning" },
                    { name: "CPU Usage", value: "42%", status: "good" },
                    { name: "Error Rate", value: "0.3%", status: "good" },
                  ].map((metric, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>{metric.name}</div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            metric.status === "good"
                              ? "bg-green-500"
                              : metric.status === "warning"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                        />
                        <span
                          className={
                            metric.status === "good"
                              ? "text-green-500"
                              : metric.status === "warning"
                                ? "text-yellow-500"
                                : "text-red-500"
                          }
                        >
                          {metric.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>System and user alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Crisis Detection",
                      description: "User ID 4872 - Potential self-harm risk",
                      time: "2 hours ago",
                      severity: "high",
                    },
                    {
                      title: "System Update",
                      description: "Knowledge base updated successfully",
                      time: "6 hours ago",
                      severity: "info",
                    },
                    {
                      title: "API Latency",
                      description: "Temporary increase in response time",
                      time: "12 hours ago",
                      severity: "medium",
                    },
                    {
                      title: "New Resource Added",
                      description: "Mental Health First Aid guide added",
                      time: "1 day ago",
                      severity: "info",
                    },
                  ].map((alert, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            alert.severity === "high"
                              ? "bg-red-500"
                              : alert.severity === "medium"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <span className="font-medium">{alert.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground pl-4">{alert.description}</p>
                      <p className="text-xs text-muted-foreground pl-4">{alert.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Detailed metrics and performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Activity className="h-8 w-8" />
                  <p>Analytics charts would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Access and download system reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Activity className="h-8 w-8" />
                  <p>Report generation interface would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Import Avatar component for the Recent Signups card
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

