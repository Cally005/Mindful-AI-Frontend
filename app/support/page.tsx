"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Brain,
  MessageSquare,
  HelpCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Search,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"

export default function SupportPage() {
  const [messageSubmitted, setMessageSubmitted] = useState(false)
  const [ticketSubmitted, setTicketSubmitted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFaqs, setFilteredFaqs] = useState(faqs)

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredFaqs(faqs)
      return
    }

    const lowercaseQuery = query.toLowerCase()
    const filtered = faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowercaseQuery) ||
        faq.answer.toLowerCase().includes(lowercaseQuery) ||
        faq.category.toLowerCase().includes(lowercaseQuery),
    )

    setFilteredFaqs(filtered)
  }

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the message to the backend
    setMessageSubmitted(true)
  }

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would create a support ticket
    setTicketSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">MindfulAI</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/resources" className="text-sm font-medium hover:text-primary hidden sm:inline-block">
              Resources
            </Link>
            <ModeToggle />
            <Link href="/chat">
              <Button>Go to Chat</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-4 px-3 py-1 text-sm">Support Center</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How Can We Help You?</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Get the support you need with our comprehensive help center, live chat, and support ticket system.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="faq" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Frequently Asked Questions</span>
              <span className="sm:hidden">FAQs</span>
            </TabsTrigger>
            <TabsTrigger value="live-chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Live Chat Support</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="ticket">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Support Ticket</span>
              <span className="sm:hidden">Ticket</span>
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Contact Information</span>
              <span className="sm:hidden">Contact</span>
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6 mt-6">
            <div className="relative max-w-xl mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["All", "Account", "Billing", "Privacy", "Technical", "Usage"].map((category) => (
                      <Button
                        key={category}
                        variant={searchQuery === category ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleSearch(category === "All" ? "" : category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="md:col-span-3">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-2">
                          <span>{faq.question}</span>
                          <Badge variant="outline" className="ml-auto shrink-0">
                            {faq.category}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pt-2 pb-4">{faq.answer}</div>
                        <div className="text-sm text-muted-foreground">
                          Was this helpful?{" "}
                          <Button variant="link" size="sm" className="px-1 h-auto">
                            Yes
                          </Button>{" "}
                          /{" "}
                          <Button variant="link" size="sm" className="px-1 h-auto">
                            No
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search query</p>
                    <Button variant="outline" onClick={() => handleSearch("")}>
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="live-chat" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Chat Support</CardTitle>
                <CardDescription>Chat with our support team in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                {messageSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. A support agent will respond to your message shortly.
                    </p>
                    <Button onClick={() => setMessageSubmitted(false)}>Send Another Message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitMessage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input id="name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <Select defaultValue="general">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Question</SelectItem>
                          <SelectItem value="account">Account Issue</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="How can we help you today?"
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Chat
                    </Button>
                  </form>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2 items-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Current response time: ~10 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>For urgent matters, please call our support line at (800) 123-4567</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Support Ticket Tab */}
          <TabsContent value="ticket" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
                <CardDescription>Submit a detailed support request for our team to review</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Ticket Created!</h3>
                    <p className="text-muted-foreground mb-2">Your ticket has been successfully created.</p>
                    <p className="font-medium mb-6">Ticket ID: #MND-{Math.floor(Math.random() * 10000)}</p>
                    <p className="text-sm text-muted-foreground mb-6">
                      We'll send you an email confirmation with your ticket details. Our support team will review your
                      request and respond within 24 hours.
                    </p>
                    <Button onClick={() => setTicketSubmitted(false)}>Create Another Ticket</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ticket-name">Your Name</Label>
                        <Input id="ticket-name" placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ticket-email">Email Address</Label>
                        <Input id="ticket-email" type="email" placeholder="john@example.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-subject">Subject</Label>
                      <Input id="ticket-subject" placeholder="Brief description of your issue" required />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ticket-category">Category</Label>
                        <Select defaultValue="technical">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="account">Account</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ticket-priority">Priority</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-description">Detailed Description</Label>
                      <Textarea
                        id="ticket-description"
                        placeholder="Please provide as much detail as possible about your issue..."
                        className="min-h-[150px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-attachment">Attachments (Optional)</Label>
                      <Input id="ticket-attachment" type="file" />
                      <p className="text-xs text-muted-foreground">
                        Max file size: 10MB. Supported formats: JPG, PNG, PDF
                      </p>
                    </div>
                    <Button type="submit" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact" className="space-y-4 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Ways to reach our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone Support</h3>
                      <p className="text-lg mb-1">(800) 123-4567</p>
                      <p className="text-sm text-muted-foreground">Available Monday-Friday, 9am-5pm EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email Support</h3>
                      <p className="text-lg mb-1">support@mindfulai.com</p>
                      <p className="text-sm text-muted-foreground">We respond to all emails within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Live Chat</h3>
                      <p className="text-lg mb-1">Available on our website</p>
                      <p className="text-sm text-muted-foreground">Chat with our support team in real-time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                  <CardDescription>When our team is available to help</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Monday - Friday</div>
                      <div>9:00 AM - 8:00 PM EST</div>

                      <div className="font-medium">Saturday</div>
                      <div>10:00 AM - 6:00 PM EST</div>

                      <div className="font-medium">Sunday</div>
                      <div>Closed</div>
                    </div>

                    <div className="pt-4">
                      <h3 className="font-medium mb-2">Holiday Schedule</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Our support team observes major US holidays. During these times, response times may be delayed.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        For urgent matters during holidays, please use our emergency support line.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/resources">View Self-Help Resources</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.slice(0, 3).map((faq, index) => (
                    <AccordionItem key={index} value={`contact-faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full" asChild>
                  <Link href="#" onClick={() => document.querySelector('[data-value="faq"]')?.click()}>
                    View All FAQs
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* CTA Section */}
      <section className="bg-primary/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Our AI assistant is available 24/7 to provide immediate support for common questions.
          </p>
          <Button size="lg" asChild>
            <Link href="/chat">
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat with MindfulAI
            </Link>
          </Button>
        </div>
      </section>

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

// FAQ data
const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "To reset your password, click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password. If you don't receive the email, check your spam folder or contact support.",
    category: "Account",
  },
  {
    question: "Is my conversation with MindfulAI confidential?",
    answer:
      "Yes, your conversations with MindfulAI are confidential and encrypted. We take your privacy seriously and do not share your personal information with third parties without your consent. You can review our privacy policy for more details.",
    category: "Privacy",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel your subscription at any time by going to Settings > Billing > Manage Subscription. Your subscription will remain active until the end of your current billing period. No refunds are provided for partial months.",
    category: "Billing",
  },
  {
    question: "Can I download my chat history?",
    answer:
      "Yes, you can download your chat history by going to your profile settings and selecting 'Export Data'. You'll receive a file containing all your conversations in a readable format.",
    category: "Technical",
  },
  {
    question: "Is MindfulAI a replacement for therapy?",
    answer:
      "No, MindfulAI is not a replacement for professional therapy or medical advice. While our AI can provide support and resources for mental wellbeing, it should be used as a complementary tool. If you're experiencing a mental health crisis, please contact a healthcare professional.",
    category: "Usage",
  },
  {
    question: "How do I connect my account to Google?",
    answer:
      "To connect your account to Google, go to Settings > Account > Linked Accounts, then click on 'Connect' next to Google. You'll be prompted to sign in to your Google account and authorize the connection.",
    category: "Account",
  },
  {
    question: "What should I do if the app is not working properly?",
    answer:
      "If you're experiencing technical issues, try these steps: 1) Refresh the page, 2) Clear your browser cache, 3) Try a different browser, 4) Check your internet connection. If the problem persists, please contact our support team with details about the issue.",
    category: "Technical",
  },
  {
    question: "How is my data used by MindfulAI?",
    answer:
      "MindfulAI uses your data to provide and improve our services. This includes personalizing your experience, training our AI models (with anonymized data), and ensuring the security of your account. You can manage your data preferences in your privacy settings.",
    category: "Privacy",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 14-day money-back guarantee for new subscriptions. If you're not satisfied with our service within the first 14 days, contact our support team for a full refund. After this period, refunds are considered on a case-by-case basis.",
    category: "Billing",
  },
  {
    question: "How can I get the most out of MindfulAI?",
    answer:
      "To get the most out of MindfulAI, we recommend: 1) Be specific about your concerns, 2) Use the mood tracking feature regularly, 3) Explore the resources section for additional support, 4) Provide feedback to help the AI better understand your needs, 5) Set regular check-in reminders.",
    category: "Usage",
  },
]

