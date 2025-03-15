"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MainNav } from "@/components/main-nav"

export default function DataEntryPage() {
  const [tremor, setTremor] = useState(5)
  const [rigidity, setRigidity] = useState(5)
  const [balance, setBalance] = useState(5)
  const [sleepQuality, setSleepQuality] = useState(5)
  const [mood, setMood] = useState(5)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // In a real app, this would call a server action to save the data
    // Simulating API call with timeout
    setTimeout(() => {
      setIsSubmitting(false)
      setSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold mb-6">Daily Symptom Tracking</h1>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="smartwatch">Smartwatch Data</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>Record Today's Symptoms</CardTitle>
                  <CardDescription>Rate your symptoms on a scale from 1 (minimal) to 10 (severe)</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="tremor">Tremor</Label>
                          <span className="text-sm text-muted-foreground">{tremor}/10</span>
                        </div>
                        <Slider
                          id="tremor"
                          min={1}
                          max={10}
                          step={1}
                          value={[tremor]}
                          onValueChange={(value) => setTremor(value[0])}
                          className="[&>span]:bg-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="rigidity">Rigidity/Stiffness</Label>
                          <span className="text-sm text-muted-foreground">{rigidity}/10</span>
                        </div>
                        <Slider
                          id="rigidity"
                          min={1}
                          max={10}
                          step={1}
                          value={[rigidity]}
                          onValueChange={(value) => setRigidity(value[0])}
                          className="[&>span]:bg-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="balance">Balance/Stability</Label>
                          <span className="text-sm text-muted-foreground">{balance}/10</span>
                        </div>
                        <Slider
                          id="balance"
                          min={1}
                          max={10}
                          step={1}
                          value={[balance]}
                          onValueChange={(value) => setBalance(value[0])}
                          className="[&>span]:bg-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="sleep">Sleep Quality</Label>
                          <span className="text-sm text-muted-foreground">{sleepQuality}/10</span>
                        </div>
                        <Slider
                          id="sleep"
                          min={1}
                          max={10}
                          step={1}
                          value={[sleepQuality]}
                          onValueChange={(value) => setSleepQuality(value[0])}
                          className="[&>span]:bg-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="mood">Mood</Label>
                          <span className="text-sm text-muted-foreground">{mood}/10</span>
                        </div>
                        <Slider
                          id="mood"
                          min={1}
                          max={10}
                          step={1}
                          value={[mood]}
                          onValueChange={(value) => setMood(value[0])}
                          className="[&>span]:bg-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any additional observations or comments about your symptoms today"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Symptom Data"}
                    </Button>

                    {success && (
                      <div className="p-3 rounded-md bg-purple-50 text-primary text-center">
                        Data submitted successfully!
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="smartwatch">
              <Card>
                <CardHeader>
                  <CardTitle>Smartwatch Integration</CardTitle>
                  <CardDescription>Connect your smartwatch to automatically track and upload data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-sync" className="flex flex-col space-y-1">
                      <span>Auto-sync data</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Automatically sync data from your smartwatch
                      </span>
                    </Label>
                    <Switch id="auto-sync" />
                  </div>

                  <div className="space-y-2">
                    <Label>Connected Devices</Label>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Apple Watch Series 8</p>
                          <p className="text-sm text-muted-foreground">Last synced: Today, 2:30 PM</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Sync Now
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Connect New Device
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

