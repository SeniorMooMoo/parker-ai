import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Download, Calendar, BookOpen, MessageSquare, MapPin } from "lucide-react"
import Link from "next/link"
import { MainNav } from "@/components/main-nav"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tremor Score</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-primary"
              >
                <path d="M12 2v20M2 12h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3.2/10</div>
              <p className="text-xs text-muted-foreground">-12% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mobility Score</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-primary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.5/10</div>
              <p className="text-xs text-muted-foreground">+4% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-primary"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.8/10</div>
              <p className="text-xs text-muted-foreground">+2% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medication Adherence</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-primary"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">95%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Symptom Trends</CardTitle>
                <CardDescription>Track your symptoms over time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Symptom Trends Chart will be added here */}
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Symptom Trends Chart Placeholder</p>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
              <CardDescription>Steps and movement patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Daily Activity Chart will be added here */}
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Daily Activity Chart Placeholder</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Medication Tracker</CardTitle>
              <CardDescription>Monitor your medication schedule and adherence</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Medication Tracker will be added here */}
              <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                <p className="text-muted-foreground">Medication Tracker Placeholder</p>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled medical appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border p-4 bg-purple-50 dark:bg-purple-900/20">
                  <Calendar className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="font-medium">Dr. Sarah Johnson</h3>
                    <p className="text-sm text-muted-foreground">Neurologist</p>
                    <p className="text-sm">March 18, 2025 - 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border p-4 bg-purple-50 dark:bg-purple-900/20">
                  <Calendar className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="font-medium">Physical Therapy</h3>
                    <p className="text-sm text-muted-foreground">With John Smith, PT</p>
                    <p className="text-sm">March 25, 2025 - 2:00 PM</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>Learn more about managing Parkinson's</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Access articles, videos, and guides about Parkinson's disease, treatments, and management strategies.
              </p>
              <Link href="/resources">
                <Button className="w-full">Browse Resources</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <MapPin className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Find a Neurologist</CardTitle>
                <CardDescription>Schedule appointments with specialists</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Find and compare neurologists specializing in Parkinson's disease in your area and schedule
                appointments.
              </p>
              <Link href="/plan-visit">
                <Button className="w-full">Plan a Visit</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>AI Symptom Assistant</CardTitle>
                <CardDescription>Get answers about your symptoms</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Ask questions about your symptoms, medication, or daily management strategies with our AI assistant.
              </p>
              <Link href="/chatbot">
                <Button className="w-full">Chat with Assistant</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

