import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookOpen, Users, Video, FileText, Download } from "lucide-react"
import { MainNav } from "@/components/main-nav"

export default function ResourcesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Parkinson's Disease Resources</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Educational materials, support groups, and helpful information for patients and caregivers
            </p>
          </div>

          <Tabs defaultValue="educational" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="educational">Educational</TabsTrigger>
              <TabsTrigger value="support">Support Groups</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="tools">Tools & Apps</TabsTrigger>
            </TabsList>

            <TabsContent value="educational" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ResourceCard
                  title="Understanding Parkinson's Disease"
                  description="A comprehensive guide to Parkinson's symptoms, progression, and management"
                  icon={<BookOpen className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Medication Management"
                  description="Learn about common medications, their effects, and how to manage your treatment plan"
                  icon={<FileText className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Exercise & Physical Therapy"
                  description="Recommended exercises and physical therapy approaches for Parkinson's patients"
                  icon={<Video className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Nutrition Guidelines"
                  description="Dietary recommendations and nutritional considerations for Parkinson's patients"
                  icon={<FileText className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Sleep Management"
                  description="Strategies for improving sleep quality and managing sleep disturbances"
                  icon={<BookOpen className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Cognitive Exercises"
                  description="Activities and exercises to help maintain cognitive function"
                  icon={<Video className="h-8 w-8 text-primary" />}
                  link="#"
                />
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Featured Articles</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Latest Research on Parkinson's Treatment</CardTitle>
                      <CardDescription>Published: March 10, 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recent advances in Parkinson's disease treatment show promising results in clinical trials. New
                        approaches focus on neuroprotection and symptom management.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                        Read Article <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Living Well with Parkinson's</CardTitle>
                      <CardDescription>Published: February 22, 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Personal stories and practical advice from individuals who are successfully managing their
                        Parkinson's symptoms and maintaining quality of life.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                        Read Article <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ResourceCard
                  title="Online Support Communities"
                  description="Connect with others living with Parkinson's through moderated online forums"
                  icon={<Users className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Local Support Groups"
                  description="Find in-person support groups in your area for patients and caregivers"
                  icon={<Users className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Caregiver Resources"
                  description="Support materials specifically for those caring for loved ones with Parkinson's"
                  icon={<FileText className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Patient Advocacy"
                  description="Organizations that advocate for Parkinson's patients and research funding"
                  icon={<Users className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Counseling Services"
                  description="Mental health resources specialized in supporting those with chronic conditions"
                  icon={<Users className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Family Education"
                  description="Resources to help family members understand and support their loved ones"
                  icon={<BookOpen className="h-8 w-8 text-primary" />}
                  link="#"
                />
              </div>

              <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Virtual Support Group Meetings</h2>
                <p className="mb-4 text-gray-500 dark:text-gray-400">
                  Join our weekly virtual support group meetings to connect with others, share experiences, and learn
                  from guest speakers.
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                    <h3 className="font-medium">Patient Support Group</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Every Tuesday at 7:00 PM EST</p>
                    <Button size="sm" className="mt-2">
                      Join Next Meeting
                    </Button>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                    <h3 className="font-medium">Caregiver Support Group</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Every Thursday at 8:00 PM EST</p>
                    <Button size="sm" className="mt-2">
                      Join Next Meeting
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="research" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Clinical Trials</CardTitle>
                    <CardDescription>Find and participate in Parkinson's research studies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                      Clinical trials are research studies that explore whether a medical strategy, treatment, or device
                      is safe and effective for humans. These studies may also show which medical approaches work best
                      for certain illnesses or groups of people.
                    </p>
                    <Button className="w-full">Find Clinical Trials</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Research News</CardTitle>
                    <CardDescription>Latest developments in Parkinson's research</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">Gene Therapy Shows Promise</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        New gene therapy approach shows promising results in early trials.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-1 text-primary">
                        Read More
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-medium">Biomarker Discovery</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Researchers identify new biomarkers for early Parkinson's detection.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-1 text-primary">
                        Read More
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-medium">Wearable Technology</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Study shows benefits of wearable devices in monitoring symptoms.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-1 text-primary">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Research Publications</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Journal of Neurology</CardTitle>
                      <CardDescription>March 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        "Advances in Deep Brain Stimulation for Parkinson's Disease"
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                        View Publication <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Neuroscience Today</CardTitle>
                      <CardDescription>February 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        "Gut Microbiome and Parkinson's: New Connections"
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                        View Publication <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Movement Disorders</CardTitle>
                      <CardDescription>January 2025</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        "Exercise as Medicine: Impact on Parkinson's Progression"
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                        View Publication <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ResourceCard
                  title="Symptom Tracking Apps"
                  description="Mobile applications to help track and manage Parkinson's symptoms"
                  icon={<Download className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Medication Reminders"
                  description="Tools to help you stay on schedule with your medication regimen"
                  icon={<Download className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Speech Therapy Apps"
                  description="Applications designed to help with speech and voice exercises"
                  icon={<Download className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Movement Exercise Videos"
                  description="Guided exercise videos specifically designed for Parkinson's patients"
                  icon={<Video className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Adaptive Equipment"
                  description="Tools and devices to help with daily activities and independence"
                  icon={<FileText className="h-8 w-8 text-primary" />}
                  link="#"
                />
                <ResourceCard
                  title="Smartwatch Integration Guides"
                  description="Instructions for setting up and using smartwatches for symptom tracking"
                  icon={<FileText className="h-8 w-8 text-primary" />}
                  link="#"
                />
              </div>

              <div className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">Featured Tool: ParkinTrack Mobile App</h2>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-2/3">
                    <p className="mb-4 text-gray-500 dark:text-gray-400">
                      Our mobile app companion to the web platform allows you to track symptoms on the go, receive
                      medication reminders, and sync data with your smartwatch. Available for iOS and Android.
                    </p>
                    <div className="flex gap-4">
                      <Button>
                        <Download className="mr-2 h-4 w-4" />
                        App Store
                      </Button>
                      <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Google Play
                      </Button>
                    </div>
                  </div>
                  <div className="md:w-1/3">
                    <img
                      src="/placeholder.svg?height=200&width=100"
                      alt="ParkinTrack Mobile App"
                      className="mx-auto h-auto max-w-full rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 ParkinTrack. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

function ResourceCard({
  title,
  description,
  icon,
  link,
}: {
  title: string
  description: string
  icon: React.ReactNode
  link: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          {icon}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="link" className="p-0 h-auto text-primary">
          Learn More <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}

