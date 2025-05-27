"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  BookOpen,
  Phone,
  Globe,
  Search,
  ExternalLink,
  Heart,
  Shield,
  Sparkles,
  HelpCircle,
  BookMarked,
  MapPin,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredResources, setFilteredResources] = useState({
    categories: categories,
    articles: articles,
    emergencyContacts: emergencyContacts,
    websites: websites,
    helpCenters: helpCenters,
  })
  const [activeTab, setActiveTab] = useState("categories")
  const [isLoaded, setIsLoaded] = useState(false)

  // Animation to show content is loaded
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Filter function for resources
  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredResources({
        categories: categories,
        articles: articles,
        emergencyContacts: emergencyContacts,
        websites: websites,
        helpCenters: helpCenters,
      })
      return
    }

    const lowercaseQuery = query.toLowerCase()

    setFilteredResources({
      categories: categories.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercaseQuery) ||
          item.description.toLowerCase().includes(lowercaseQuery) ||
          item.shortDescription.toLowerCase().includes(lowercaseQuery),
      ),
      articles: articles.filter(
        (item) =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.category.toLowerCase().includes(lowercaseQuery) ||
          item.excerpt.toLowerCase().includes(lowercaseQuery) ||
          item.source.toLowerCase().includes(lowercaseQuery),
      ),
      emergencyContacts: emergencyContacts.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercaseQuery) ||
          item.description.toLowerCase().includes(lowercaseQuery) ||
          (item.phone && item.phone.includes(query)),
      ),
      websites: websites.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercaseQuery) ||
          item.category.toLowerCase().includes(lowercaseQuery) ||
          item.description.toLowerCase().includes(lowercaseQuery),
      ),
      helpCenters: helpCenters.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercaseQuery) ||
          item.type.toLowerCase().includes(lowercaseQuery) ||
          item.description.toLowerCase().includes(lowercaseQuery) ||
          item.services.some((service) => service.toLowerCase().includes(lowercaseQuery)),
      ),
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
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
            <Link href="/support" className="text-sm font-medium hover:text-primary hidden sm:inline-block">
              Support
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
            <Badge className="mb-4 px-3 py-1 text-sm">Mental Health Resources</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Support & Resources</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Access a curated collection of mental health resources, articles, and support services to help you on your
              wellness journey.
            </p>

            {/* Search bar */}
            <div className="relative max-w-xl mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-10 h-12 rounded-full"
                value={searchQuery}
                onChange={(e: any) => handleSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {["Anxiety", "Depression", "Stress", "Sleep", "Mindfulness", "Relationships"].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSearch(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="categories" className="mb-8" value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="categories" onClick={() => setActiveTab("categories")}>
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Categories</span>
                <span className="sm:hidden">Categories</span>
              </TabsTrigger>
              <TabsTrigger value="articles" onClick={() => setActiveTab("articles")}>
                <BookMarked className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Articles</span>
                <span className="sm:hidden">Articles</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" onClick={() => setActiveTab("emergency")}>
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Emergency</span>
                <span className="sm:hidden">Emergency</span>
              </TabsTrigger>
              <TabsTrigger value="websites" onClick={() => setActiveTab("websites")}>
                <Globe className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Websites</span>
                <span className="sm:hidden">Websites</span>
              </TabsTrigger>
              <TabsTrigger value="help-centers" onClick={() => setActiveTab("help-centers")}>
                <MapPin className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Help Centers</span>
                <span className="sm:hidden">Centers</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 mt-6">
            <motion.div
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
            >
              {filteredResources.categories.map((category) => (
                <motion.div key={category.id} variants={itemVariants}>
                  <Card
                    className="overflow-hidden border-l-4 h-full transition-all hover:shadow-md"
                    style={{ borderLeftColor: category.color }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{category.name}</CardTitle>
                        <Badge variant="outline">{category.resourceCount} resources</Badge>
                      </div>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{category.shortDescription}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Explore Resources
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {filteredResources.categories.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No categories found</h3>
                <p className="text-muted-foreground">Try adjusting your search query</p>
              </div>
            )}
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-4 mt-6">
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
            >
              {filteredResources.articles.map((article) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <Card className="overflow-hidden transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{article.title}</CardTitle>
                        <Badge>{article.category}</Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {article.source}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{article.excerpt}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Read Article
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>External Link</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}

              {filteredResources.articles.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No articles found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-4 mt-6">
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
            >
              <motion.div variants={itemVariants}>
                <Card className="border-l-4 border-l-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      If you're in immediate danger
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold text-lg">Call emergency services: 911</p>
                    <p className="mt-4">
                      If you or someone you know is in immediate danger or having thoughts of suicide, please call
                      emergency services immediately.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {filteredResources.emergencyContacts.map((contact) => (
                <motion.div key={contact.id} variants={itemVariants}>
                  <Card className="transition-all hover:shadow-md">
                    <CardHeader>
                      <CardTitle>{contact.name}</CardTitle>
                      <CardDescription>{contact.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <p className="font-medium">{contact.phone}</p>
                      </div>
                      {contact.text && <p className="mt-2 text-sm">Text: {contact.text}</p>}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        <span>External Link</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}

              {filteredResources.emergencyContacts.length === 0 && (
                <div className="text-center py-12">
                  <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No emergency contacts found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Websites Tab */}
          <TabsContent value="websites" className="space-y-4 mt-6">
            <motion.div
              className="grid gap-4 md:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
            >
              {filteredResources.websites.map((website) => (
                <motion.div key={website.id} variants={itemVariants}>
                  <Card className="h-full transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{website.name}</CardTitle>
                        <Badge variant="outline">{website.category}</Badge>
                      </div>
                      <CardDescription>{website.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{website.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" className="gap-2" asChild>
                        <a href={website.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4" />
                          Visit Website
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1" asChild>
                        <a href={website.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span>Open</span>
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}

              {filteredResources.websites.length === 0 && (
                <div className="text-center py-12 col-span-2">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No websites found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Help Centers Tab */}
          <TabsContent value="help-centers" className="space-y-4 mt-6">
            <motion.div
              className="grid gap-4 md:grid-cols-2"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
            >
              {filteredResources.helpCenters.map((center) => (
                <motion.div key={center.id} variants={itemVariants}>
                  <Card className="flex flex-col h-full transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{center.name}</CardTitle>
                        <Badge variant="outline">{center.type}</Badge>
                      </div>
                      <CardDescription>{center.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2">
                        <p>{center.description}</p>
                        <div className="text-sm text-muted-foreground">
                          <p className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <strong>Services:</strong> {center.services.join(", ")}
                          </p>
                          {center.address && (
                            <p className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <strong>Address:</strong> {center.address}
                            </p>
                          )}
                          {center.phone && (
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <strong>Phone:</strong> {center.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full gap-2" asChild>
                        <a href={center.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          Visit Help Center
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}

              {filteredResources.helpCenters.length === 0 && (
                <div className="text-center py-12 col-span-2">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No help centers found</h3>
                  <p className="text-muted-foreground">Try adjusting your search query</p>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* CTA Section */}
      <section className="bg-primary/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need personalized support?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Our AI assistant is available 24/7 to provide personalized mental health support and guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/chat">Chat with MindfulAI</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/support">Get Human Support</Link>
            </Button>
          </div>
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

// Categorized mental health topics
const categories = [
  {
    id: 1,
    name: "Managing Anxiety",
    description: "Tools and techniques for anxiety management",
    shortDescription:
      "Learn effective strategies to manage anxiety, panic attacks, and worry through evidence-based approaches.",
    resourceCount: 15,
    color: "#4299E1", // blue
  },
  {
    id: 2,
    name: "Depression Support",
    description: "Resources for understanding and coping with depression",
    shortDescription:
      "Find support for depression symptoms, including self-care strategies and professional treatment options.",
    resourceCount: 12,
    color: "#9F7AEA", // purple
  },
  {
    id: 3,
    name: "Self-Care Strategies",
    description: "Practical self-care techniques for daily mental wellness",
    shortDescription:
      "Discover everyday practices to maintain mental wellbeing, reduce stress, and improve emotional health.",
    resourceCount: 18,
    color: "#48BB78", // green
  },
  {
    id: 4,
    name: "Stress Management",
    description: "Effective ways to reduce and manage stress",
    shortDescription:
      "Learn techniques to identify stressors and develop healthy coping mechanisms for stress reduction.",
    resourceCount: 14,
    color: "#ED8936", // orange
  },
  {
    id: 5,
    name: "Sleep Improvement",
    description: "Techniques for better sleep quality",
    shortDescription:
      "Explore methods to improve sleep habits, overcome insomnia, and establish healthy sleep patterns.",
    resourceCount: 9,
    color: "#667EEA", // indigo
  },
  {
    id: 6,
    name: "Mindfulness & Meditation",
    description: "Practices for present-moment awareness",
    shortDescription:
      "Learn mindfulness techniques and meditation practices to reduce anxiety and improve mental clarity.",
    resourceCount: 16,
    color: "#F56565", // red
  },
]

// Articles data
const articles = [
  {
    id: 1,
    title: "Understanding Anxiety: Causes, Symptoms, and Coping Strategies",
    category: "Managing Anxiety",
    source: "Mental Health Foundation",
    excerpt:
      "Anxiety is a normal emotion that we all experience, but it can become overwhelming. This article explores the nature of anxiety disorders and provides evidence-based strategies for managing symptoms.",
  },
  {
    id: 2,
    title: "The Science of Sleep: How Quality Rest Impacts Mental Health",
    category: "Sleep Improvement",
    source: "Sleep Research Institute",
    excerpt:
      "Sleep and mental health are closely connected. This article examines how sleep affects psychological well-being and offers practical tips for improving sleep quality.",
  },
  {
    id: 3,
    title: "Mindfulness Meditation: A Beginner's Guide",
    category: "Mindfulness & Meditation",
    source: "Center for Mindfulness",
    excerpt:
      "Mindfulness meditation has been shown to reduce stress and improve mental clarity. This step-by-step guide introduces the practice and provides simple exercises for beginners.",
  },
  {
    id: 4,
    title: "Recognizing Depression: Signs, Symptoms, and Treatment Options",
    category: "Depression Support",
    source: "American Psychological Association",
    excerpt:
      "Depression is more than just feeling sad. This comprehensive article helps identify the symptoms of depression and explores various treatment approaches.",
  },
  {
    id: 5,
    title: "Building Resilience: Strengthening Your Mental Health in Challenging Times",
    category: "Self-Care Strategies",
    source: "Resilience Research Center",
    excerpt:
      "Resilience is the ability to bounce back from adversity. Learn practical strategies for developing resilience and maintaining mental well-being during difficult periods.",
  },
  {
    id: 6,
    title: "The Power of Self-Compassion in Mental Health Recovery",
    category: "Self-Care Strategies",
    source: "Compassion Institute",
    excerpt:
      "Self-compassion involves treating yourself with the same kindness you would offer to a good friend. This article explores how practicing self-compassion can support mental health recovery and emotional well-being.",
  },
  {
    id: 7,
    title: "Understanding Panic Attacks: What They Are and How to Manage Them",
    category: "Managing Anxiety",
    source: "Anxiety and Depression Association",
    excerpt:
      "Panic attacks can be frightening and overwhelming. This article explains what happens during a panic attack, why they occur, and provides practical techniques for managing them when they happen.",
  },
]

// Emergency contacts data
const emergencyContacts = [
  {
    id: 1,
    name: "National Suicide Prevention Lifeline",
    description: "24/7, free and confidential support for people in distress",
    phone: "1-800-273-8255",
    text: "Text HOME to 741741",
    website: "https://suicidepreventionlifeline.org",
  },
  {
    id: 2,
    name: "Crisis Text Line",
    description: "Free 24/7 text support for those in crisis",
    phone: "N/A",
    text: "Text HOME to 741741",
    website: "https://www.crisistextline.org",
  },
  {
    id: 3,
    name: "SAMHSA's National Helpline",
    description:
      "Treatment referral and information service for individuals facing mental health or substance use disorders",
    phone: "1-800-662-4357",
    text: null,
    website: "https://www.samhsa.gov/find-help/national-helpline",
  },
  {
    id: 4,
    name: "Veterans Crisis Line",
    description: "Connects veterans and their families with qualified responders",
    phone: "1-800-273-8255 (Press 1)",
    text: "Text 838255",
    website: "https://www.veteranscrisisline.net",
  },
  {
    id: 5,
    name: "The Trevor Project",
    description: "Crisis intervention and suicide prevention for LGBTQ+ young people",
    phone: "1-866-488-7386",
    text: "Text START to 678678",
    website: "https://www.thetrevorproject.org",
  },
]

// Websites data
const websites = [
  {
    id: 1,
    name: "National Institute of Mental Health",
    category: "Government Resource",
    description:
      "The lead federal agency for research on mental disorders, providing information on various mental health conditions.",
    website: "https://www.nimh.nih.gov",
  },
  {
    id: 2,
    name: "Mental Health America",
    category: "Non-profit Organization",
    description:
      "Dedicated to addressing the needs of those living with mental illness and promoting mental health for all.",
    website: "https://www.mhanational.org",
  },
  {
    id: 3,
    name: "Anxiety and Depression Association of America",
    category: "Non-profit Organization",
    description:
      "Provides resources for anxiety, depression, and related disorders, including self-help tools and support group information.",
    website: "https://adaa.org",
  },
  {
    id: 4,
    name: "Psychology Today",
    category: "Mental Health Publication",
    description:
      "Offers a therapist directory and articles on various mental health topics written by experts in the field.",
    website: "https://www.psychologytoday.com",
  },
  {
    id: 5,
    name: "Headspace",
    category: "Meditation App",
    description:
      "A popular meditation app that offers guided sessions for stress reduction, focus, and sleep improvement.",
    website: "https://www.headspace.com",
  },
  {
    id: 6,
    name: "Calm",
    category: "Meditation App",
    description:
      "An app for meditation, sleep stories, and relaxation techniques to help reduce stress and improve sleep.",
    website: "https://www.calm.com",
  },
]

// Help centers data
const helpCenters = [
  {
    id: 1,
    name: "Mayo Clinic Mental Health Center",
    type: "Medical Institution",
    description: "Comprehensive mental health services from one of the world's leading medical institutions.",
    services: ["Diagnosis", "Treatment", "Research", "Education"],
    website: "https://www.mayoclinic.org/departments-centers/psychiatry-psychology/home/orc-20303075",
    phone: "1-800-446-2279",
  },
  {
    id: 2,
    name: "McLean Hospital",
    type: "Psychiatric Hospital",
    description: "Harvard Medical School affiliate providing comprehensive psychiatric services.",
    services: ["Inpatient Care", "Outpatient Programs", "Specialized Treatment"],
    website: "https://www.mcleanhospital.org",
    phone: "617-855-2000",
  },
  {
    id: 3,
    name: "NAMI HelpLine",
    type: "Support Service",
    description: "National Alliance on Mental Illness information and referral service.",
    services: ["Information", "Resource Referrals", "Support"],
    website: "https://www.nami.org/help",
    phone: "1-800-950-6264",
  },
  {
    id: 4,
    name: "BetterHelp",
    type: "Online Therapy Platform",
    description: "Accessible online counseling and therapy services.",
    services: ["Individual Therapy", "Couples Therapy", "Teen Counseling"],
    website: "https://www.betterhelp.com",
  },
  {
    id: 5,
    name: "Talkspace",
    type: "Online Therapy Platform",
    description: "Text, audio, and video-based therapy with licensed professionals.",
    services: ["Text Therapy", "Video Sessions", "Psychiatry Services"],
    website: "https://www.talkspace.com",
  },
  {
    id: 6,
    name: "Mental Health America Affiliate Network",
    type: "Community Resources",
    description: "Local MHA affiliates providing community-based services across the US.",
    services: ["Support Groups", "Education", "Advocacy", "Screening"],
    website: "https://www.mhanational.org/find-affiliate",
  },
]
