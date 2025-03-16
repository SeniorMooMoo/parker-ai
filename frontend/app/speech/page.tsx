"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { Upload, Mic, BarChart3, FileAudio, AlertCircle, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for the graph
const sampleScoreData = [
  { date: "Jan 1", clarity: 85, rhythm: 78, pitch: 92 },
  { date: "Jan 8", clarity: 82, rhythm: 80, pitch: 89 },
  { date: "Jan 15", clarity: 79, rhythm: 76, pitch: 85 },
  { date: "Jan 22", clarity: 81, rhythm: 78, pitch: 87 },
  { date: "Jan 29", clarity: 84, rhythm: 82, pitch: 90 },
  { date: "Feb 5", clarity: 86, rhythm: 83, pitch: 91 },
]

type AudioFile = {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export default function SpeechAnalysisPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [scoreData, setScoreData] = useState(sampleScoreData)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError(null)

    const newFiles: AudioFile[] = []

    Array.from(files).forEach((file) => {
      // Check if file is an audio file
      if (!file.type.startsWith("audio/")) {
        setError("Please upload audio files only (MP3, WAV, etc.)")
        return
      }

      // Create a URL for the audio file
      const url = URL.createObjectURL(file)

      newFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url,
      })
    })

    setAudioFiles((prev) => [...prev, ...newFiles])

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (id: string) => {
    setAudioFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.id !== id)
      return updatedFiles
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const analyzeAudio = () => {
    if (audioFiles.length === 0) {
      setError("Please upload audio files before analyzing")
      return
    }

    setError(null)
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          setAnalysisComplete(true)

          // Add a new data point to the graph
          const today = new Date()
          const dateStr = `${today.toLocaleString("default", { month: "short" })} ${today.getDate()}`

          setScoreData((prev) => [
            ...prev,
            {
              date: dateStr,
              clarity: Math.floor(Math.random() * 20) + 70, // Random score between 70-90
              rhythm: Math.floor(Math.random() * 20) + 70,
              pitch: Math.floor(Math.random() * 20) + 70,
            },
          ])

          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <MainNav />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Speech Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Upload audio recordings of your speech to track changes and monitor progress
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Audio</CardTitle>
                  <CardDescription>Upload recordings of your speech for analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-gray-50 dark:bg-gray-900/50">
                    <Mic className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
                      Drag and drop audio files here, or click to browse
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      id="audio-upload"
                    />
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Select Audio Files
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {audioFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Uploaded Files</h3>
                      <div className="space-y-2">
                        {audioFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md"
                          >
                            <div className="flex items-center">
                              <FileAudio className="h-5 w-5 text-primary mr-2" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" onClick={analyzeAudio} disabled={isAnalyzing || audioFiles.length === 0}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {isAnalyzing ? "Analyzing..." : "Analyze Speech"}
                  </Button>

                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analyzing audio...</span>
                        <span>{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Speech Assessment Tips</CardTitle>
                  <CardDescription>Guidelines for recording speech samples</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">For best results:</h3>
                    <ul className="list-disc pl-5 text-sm space-y-1 text-gray-500 dark:text-gray-400">
                      <li>Record in a quiet environment with minimal background noise</li>
                      <li>Position yourself 6-12 inches from the microphone</li>
                      <li>Speak at a normal volume and pace</li>
                      <li>Try reading the same passage each time for consistent comparison</li>
                      <li>Record for at least 30 seconds for accurate analysis</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-7">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Speech Analysis Results</CardTitle>
                  <CardDescription>Track changes in your speech patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="graph">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="graph">Graph View</TabsTrigger>
                      <TabsTrigger value="table">Table View</TabsTrigger>
                    </TabsList>
                    <TabsContent value="graph" className="space-y-4">
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={scoreData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 10,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[50, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="clarity"
                              stroke="hsl(var(--chart-1))"
                              name="Speech Clarity"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="rhythm"
                              stroke="hsl(var(--chart-2))"
                              name="Speech Rhythm"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="pitch"
                              stroke="hsl(var(--chart-3))"
                              name="Pitch Variation"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">What These Scores Mean</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          These scores measure different aspects of your speech that may be affected by Parkinson's:
                        </p>
                        <ul className="list-disc pl-5 text-sm space-y-1 text-gray-500 dark:text-gray-400">
                          <li>
                            <span className="font-medium">Speech Clarity:</span> How clearly words are pronounced
                          </li>
                          <li>
                            <span className="font-medium">Speech Rhythm:</span> Consistency and timing of speech
                          </li>
                          <li>
                            <span className="font-medium">Pitch Variation:</span> Range and control of vocal pitch
                          </li>
                        </ul>
                      </div>
                    </TabsContent>
                    <TabsContent value="table">
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3 text-sm font-medium">Date</th>
                              <th className="text-left p-3 text-sm font-medium">Speech Clarity</th>
                              <th className="text-left p-3 text-sm font-medium">Speech Rhythm</th>
                              <th className="text-left p-3 text-sm font-medium">Pitch Variation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scoreData.map((entry, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/20" : ""}>
                                <td className="p-3 text-sm">{entry.date}</td>
                                <td className="p-3 text-sm">{entry.clarity}/100</td>
                                <td className="p-3 text-sm">{entry.rhythm}/100</td>
                                <td className="p-3 text-sm">{entry.pitch}/100</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 Parker. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </a>
          <a className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  )
}

