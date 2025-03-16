"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MainNav } from "@/components/main-nav"
// Import the useIsMobile hook
import { useIsMobile } from "@/hooks/use-mobile"

// Add the hook inside the component
export default function CognitiveAssessmentLoading() {
  const isMobile = useIsMobile()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <Skeleton className="h-8 md:h-10 w-48 md:w-64 mb-2" />
            <Skeleton className="h-4 md:h-5 w-64 md:w-96" />
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
              <Skeleton className="h-4 md:h-5 w-10 md:w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>

          <div className="mb-6">
            <Skeleton className="h-8 md:h-10 w-full mb-4" />

            <Card>
              <CardHeader>
                <Skeleton className="h-5 md:h-6 w-36 md:w-48 mb-2" />
                <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-[150px] md:h-[200px] w-full" />
                <div className="flex flex-col items-center">
                  <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
                </div>
                <Skeleton className="h-3 md:h-4 w-full" />
                <Skeleton className="h-3 md:h-4 w-5/6 mx-auto" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-8 md:h-10 w-20 md:w-24" />
                <Skeleton className="h-8 md:h-10 w-24 md:w-32" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

