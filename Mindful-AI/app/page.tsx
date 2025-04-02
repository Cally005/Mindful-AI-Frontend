import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModeToggle } from "@/components/mode-toggle"
import { Brain, MessageCircle, BarChart3, Shield, Heart } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">MindfulAI</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Home
              </Link>
              <Link href="/resources" className="text-sm font-medium hover:text-primary">
                Resources
              </Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Companion for <span className="text-primary">Mental Wellbeing</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
              MindfulAI provides confidential, empathetic support for managing stress, anxiety, and mental health
              challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/chat/demo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How MindfulAI Helps</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <MessageCircle className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Supportive Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Chat with our AI assistant anytime for empathetic support and practical coping strategies.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Mood Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Monitor your emotional wellbeing over time with simple mood tracking and personalized insights.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Private & Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Your conversations are private and secure. We prioritize your confidentiality and data protection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Ready to prioritize your mental wellbeing?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of users who have found support and guidance through MindfulAI.
            </p>
            <Link href="/signup">
              <Button size="lg">Create Free Account</Button>
            </Link>
          </div>
        </section>
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

