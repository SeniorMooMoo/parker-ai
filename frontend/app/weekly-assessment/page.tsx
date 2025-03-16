"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mic,
  Camera,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Upload,
  Moon,
  Sun,
  FileAudio,
  Download,
} from "lucide-react"

// Import the useIsMobile hook at the top with other imports
import { useIsMobile } from "@/hooks/use-mobile"

// Step interface
interface Step {
  id: string
  title: string
  description: string
}

// Steps for the assessment
const steps: Step[] = [
  {
    id: "speech",
    title: "Speech Analysis",
    description: "Record your voice describing the image",
  },
  {
    id: "handwriting",
    title: "Handwriting Assessment",
    description: "Take a photo of your handwriting sample",
  },
  {
    id: "reaction",
    title: "Reaction Time Test",
    description: "Test your reaction time",
  },
  {
    id: "summary",
    title: "Assessment Complete",
    description: "Review your results",
  },
]

// Replace the random image categories with 3 fixed image paths
// IMPORTANT: Add your 3 images to the public folder and update these paths
const speechImages = [
  "/speech-image-1.jpg", // Place this image in public/speech-image-1.jpg
  "/speech-image-2.jpg", // Place this image in public/speech-image-2.jpg
  "/speech-image-3.jpg", // Place this image in public/speech-image-3.jpg
]

// Image prompts corresponding to each image
const imagePrompts = [
  "Please describe what you see in this image in detail.",
  "Look at this image and describe all the elements you can see.",
  "Please describe this image and what's happening in it.",
]

export default function CognitiveAssessmentPage() {
  // State for current step
  const [currentStep, setCurrentStep] = useState<string>("speech")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Accessibility states
  const [highContrast, setHighContrast] = useState<boolean>(false)
  const [voiceGuidance, setVoiceGuidance] = useState<boolean>(false)

  // Speech task states
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingProgress, setRecordingProgress] = useState<number>(0)
  const [recordingComplete, setRecordingComplete] = useState<boolean>(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [waveformValues, setWaveformValues] = useState<number[]>(Array(20).fill(2))
  const waveformInterval = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioFileInputRef = useRef<HTMLInputElement>(null)

  // Random image for speech task
  const [randomImage, setRandomImage] = useState<string>("")
  const [imagePrompt, setImagePrompt] = useState<string>("")

  // Handwriting task states
  const [handwritingImage, setHandwritingImage] = useState<string | null>(null)
  const [handwritingComplete, setHandwritingComplete] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reaction time task states
  const [reactionState, setReactionState] = useState<"waiting" | "ready" | "active" | "complete">("waiting")
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [averageReactionTime, setAverageReactionTime] = useState<number | null>(null)
  const [previousReactionTime, setPreviousReactionTime] = useState<number | null>(400) // Mock previous result
  const [startTime, setStartTime] = useState<number | null>(null)
  const reactionTimeout = useRef<NodeJS.Timeout | null>(null)

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Add the hook inside the component, near the top with other state declarations
  const isMobile = useIsMobile()

  // Generate random image on component mount
  useEffect(() => {
    generateRandomImage()
  }, [])

  // Generate a random image for the speech task from the predefined set
  const generateRandomImage = () => {
    // Select a random index (0, 1, or 2)
    const randomIndex = Math.floor(Math.random() * 3)

    // Set the image and corresponding prompt
    setRandomImage(speechImages[randomIndex])
    setImagePrompt(imagePrompts[randomIndex])
  }

  // Effect to handle voice guidance
  useEffect(() => {
    if (voiceGuidance) {
      const instructions: { [key: string]: string } = {
        speech:
          "Press and hold the microphone button to record your voice describing the image shown. Record for up to 30 seconds.",
        handwriting:
          "Write the sentence shown on a piece of paper, then take a photo of your handwriting and upload it.",
        reaction: "When the circle turns green, tap it as quickly as you can. We'll measure your reaction time.",
        summary: "Your weekly assessment is complete. The results have been sent to your doctor.",
      }

      const currentInstruction = instructions[currentStep]
      if (currentInstruction) {
        const speech = new SpeechSynthesisUtterance(currentInstruction)
        window.speechSynthesis.speak(speech)
      }

      return () => {
        window.speechSynthesis.cancel()
      }
    }
  }, [currentStep, voiceGuidance])

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Request microphone permission
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch (err) {
      console.error("Error accessing microphone:", err)
      setErrorMessage("Microphone access denied. Please allow microphone access to record.")
      return false
    }
  }

  // Handle recording start
  const startRecording = async () => {
    // Clear any previous error messages
    setErrorMessage(null)

    // Check for microphone permission
    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) return

    try {
      // For mobile devices, we need to set different constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Create blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)

        // Create URL for audio playback
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingProgress(0)

      // Simulate recording progress
      recordingIntervalRef.current = setInterval(() => {
        setRecordingProgress((prev) => {
          if (prev >= 100) {
            stopRecording()
            return 100
          }
          return prev + 100 / 30 // 30 seconds max
        })
      }, 1000)

      // Simulate waveform animation
      waveformInterval.current = setInterval(() => {
        setWaveformValues((prev) => prev.map(() => Math.floor(Math.random() * 18) + 2))
      }, 100)
    } catch (err) {
      console.error("Error starting recording:", err)
      setErrorMessage("Failed to start recording. Please check your microphone.")
    }
  }

  // Handle recording stop
  const stopRecording = () => {
    setIsRecording(false)

    // Clear intervals
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }

    if (waveformInterval.current) {
      clearInterval(waveformInterval.current)
      waveformInterval.current = null
      setWaveformValues(Array(20).fill(2))
    }

    // Stop media recorder if it exists
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    // Only mark as complete if recorded for at least 5 seconds
    if (recordingProgress >= 16) {
      // ~5 seconds
      setRecordingComplete(true)
      showSuccessMessage("Speech recording saved successfully!")

      // Mark step as completed
      if (!completedSteps.includes("speech")) {
        setCompletedSteps((prev) => [...prev, "speech"])
      }
    }
  }

  // Special handler for mobile tap recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Handle audio file upload
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an audio file
    if (!file.type.startsWith("audio/")) {
      setErrorMessage("Please upload an audio file (.mp3, .wav, or .mp4)")
      return
    }

    // Create blob URL for audio playback
    const url = URL.createObjectURL(file)
    setAudioUrl(url)
    setAudioBlob(file)
    setRecordingComplete(true)

    showSuccessMessage("Audio file uploaded successfully!")

    // Mark step as completed
    if (!completedSteps.includes("speech")) {
      setCompletedSteps((prev) => [...prev, "speech"])
    }
  }

  // Download recorded audio as WAV file
  const downloadAudio = () => {
    if (!audioBlob) return

    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = "speech-assessment.wav"
    document.body.appendChild(a)
    a.click()

    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setHandwritingImage(event.target.result as string)
        setHandwritingComplete(true)
        showSuccessMessage("Handwriting image uploaded successfully!")

        // Mark step as completed
        if (!completedSteps.includes("handwriting")) {
          setCompletedSteps((prev) => [...prev, "handwriting"])
        }
      }
    }
    reader.readAsDataURL(file)
  }

  // Start reaction test
  const startReactionTest = () => {
    setReactionState("ready")

    // Random delay between 3-5 seconds
    const delay = Math.floor(Math.random() * 2000) + 3000

    reactionTimeout.current = setTimeout(() => {
      setReactionState("active")
      setStartTime(Date.now())
    }, delay)
  }

  // Handle reaction button click
  const handleReactionClick = () => {
    if (reactionState === "waiting") {
      startReactionTest()
    } else if (reactionState === "ready") {
      // Clicked too early
      if (reactionTimeout.current) {
        clearTimeout(reactionTimeout.current)
      }
      setReactionState("waiting")
    } else if (reactionState === "active") {
      const endTime = Date.now()
      const reactionTime = startTime ? endTime - startTime : 0

      setReactionTimes((prev) => [...prev, reactionTime])

      // Calculate average after at least 3 attempts
      if (reactionTimes.length >= 2) {
        const newTimes = [...reactionTimes, reactionTime]
        const avg = Math.round(newTimes.reduce((a, b) => a + b, 0) / newTimes.length)
        setAverageReactionTime(avg)

        // Mark as complete after 5 attempts
        if (newTimes.length >= 5) {
          setReactionState("complete")
          showSuccessMessage("Reaction time test completed!")

          // Mark step as completed
          if (!completedSteps.includes("reaction")) {
            setCompletedSteps((prev) => [...prev, "reaction"])
          }
        } else {
          // Continue with more attempts
          setReactionState("waiting")
        }
      } else {
        setReactionState("waiting")
      }
    }
  }

  // Show success message with vibration
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate(200)
    }

    // Clear message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)
  }

  // Navigate to next step
  const goToNextStep = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  // Navigate to previous step
  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  // Reset all tasks
  const resetAssessment = () => {
    setCurrentStep("speech")
    setCompletedSteps([])
    setRecordingComplete(false)
    setRecordingProgress(0)
    setAudioBlob(null)
    setAudioUrl(null)
    setHandwritingImage(null)
    setHandwritingComplete(false)
    setReactionState("waiting")
    setReactionTimes([])
    setAverageReactionTime(null)
    generateRandomImage()
  }

  // Calculate progress percentage
  const progressPercentage = Math.round((completedSteps.length / (steps.length - 1)) * 100)

  // Get current step index
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)
  const currentStepNumber = currentStepIndex + 1

  // Check if current step is completed
  const isCurrentStepCompleted = completedSteps.includes(currentStep)

  // Check if can proceed to next step
  const canProceedToNext = isCurrentStepCompleted || currentStep === "summary"

  return (
    <div className={`flex min-h-screen flex-col ${highContrast ? "bg-blue-950 text-white" : ""}`}>
      <header
        className={`sticky top-0 z-10 flex h-16 items-center gap-4 border-b ${highContrast ? "bg-blue-950 border-white" : "bg-background"} px-4 md:px-6`}
      >
        <MainNav />

        {/* Accessibility Controls */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
            <Label htmlFor="high-contrast" className="text-sm cursor-pointer">
              {highContrast ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="voice-guidance" checked={voiceGuidance} onCheckedChange={setVoiceGuidance} />
            <Label htmlFor="voice-guidance" className="text-sm cursor-pointer">
              {voiceGuidance ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Label>
          </div>
        </div>
      </header>

      <main className={`flex-1 p-4 md:p-6 ${highContrast ? "bg-blue-950 text-white" : ""}`}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${highContrast ? "text-white" : ""}`}>
              Weekly Cognitive Assessment
            </h1>
            <p className={highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}>
              Complete these three tasks to assess your cognitive and motor functions
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${highContrast ? "text-white" : ""}`}>
                {completedSteps.length}/{steps.length - 1} Completed
              </span>
              <span className={`text-sm ${highContrast ? "text-white" : ""}`}>{progressPercentage}%</span>
            </div>
            <Progress
              value={progressPercentage}
              className={`h-2 ${highContrast ? "bg-blue-800" : ""}`}
              indicatorClassName={highContrast ? "bg-white" : ""}
            />
          </div>

          {/* Success Message */}
          {successMessage && (
            <Alert
              className={`mb-6 ${highContrast ? "bg-green-800 border-green-600 text-white" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert
              className={`mb-6 ${highContrast ? "bg-red-800 border-red-600 text-white" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}
              variant="destructive"
            >
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Step Navigation */}
          <div className="mb-6">
            <Tabs value={currentStep} className="w-full">
              <TabsList
                className={`grid w-full ${isMobile ? "grid-cols-2 gap-2" : "grid-cols-4"} ${highContrast ? "bg-blue-900" : ""}`}
              >
                {steps.map((step) => (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    disabled={!completedSteps.includes(step.id) && step.id !== "summary" && step.id !== currentStep}
                    className={`${highContrast ? "data-[state=active]:bg-white data-[state=active]:text-blue-950 text-white" : ""} ${completedSteps.includes(step.id) ? "text-green-600 dark:text-green-400" : ""} ${isMobile ? "text-xs py-1" : ""}`}
                  >
                    {completedSteps.includes(step.id) && <CheckCircle2 className="h-4 w-4 mr-1" />}
                    {step.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Speech Analysis Task */}
              <TabsContent value="speech">
                <Card className={highContrast ? "bg-blue-900 border-white text-white" : ""}>
                  <CardHeader>
                    <CardTitle className={highContrast ? "text-white" : ""}>Speech Analysis</CardTitle>
                    <CardDescription className={highContrast ? "text-gray-200" : ""}>
                      Record your voice describing the image below
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Random image to describe */}
                    <div
                      className={`border rounded-lg p-4 flex flex-col items-center justify-center ${highContrast ? "border-white" : ""}`}
                    >
                      {randomImage ? (
                        <>
                          <img
                            src={randomImage || "/placeholder.svg"}
                            alt="Random image to describe"
                            className="max-h-[200px] md:max-h-[300px] w-full object-contain mb-4"
                            style={{ objectFit: "contain" }}
                          />
                          <p
                            className={`text-center font-medium text-sm md:text-base ${highContrast ? "text-white" : ""}`}
                          >
                            {imagePrompt}
                          </p>
                        </>
                      ) : (
                        <div className="h-[150px] md:h-[200px] w-full flex items-center justify-center">
                          <p className={`text-center ${highContrast ? "text-gray-200" : "text-gray-500"}`}>
                            Loading image...
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <p className={`text-lg font-medium mb-2 ${highContrast ? "text-white" : ""}`}>
                        Press and hold to record your voice describing this picture
                      </p>
                      <p className={`text-sm ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                        Speak clearly for up to 30 seconds
                      </p>
                    </div>

                    {/* Recording button and waveform */}
                    <div className="flex flex-col items-center">
                      {isRecording && (
                        <div className="flex items-center gap-1 mb-4 h-16 md:h-20">
                          {waveformValues.map((value, index) => (
                            <div
                              key={index}
                              className={`w-1 md:w-2 rounded-full ${highContrast ? "bg-white" : "bg-primary"}`}
                              style={{ height: `${value * (isMobile ? 4 : 5)}px` }}
                            ></div>
                          ))}
                        </div>
                      )}

                      <button
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? highContrast
                              ? "bg-red-600 text-white"
                              : "bg-red-500 text-white"
                            : highContrast
                              ? "bg-white text-blue-950"
                              : "bg-primary text-white"
                        }`}
                        onMouseDown={!isMobile ? startRecording : undefined}
                        onMouseUp={!isMobile ? stopRecording : undefined}
                        onTouchStart={isMobile ? startRecording : undefined}
                        onTouchEnd={isMobile ? stopRecording : undefined}
                        onClick={isMobile ? (isRecording ? stopRecording : startRecording) : undefined}
                        aria-label="Record speech"
                      >
                        <Mic className="h-12 w-12" />
                      </button>

                      {isMobile && !isRecording && (
                        <p className={`mt-2 text-xs text-center ${highContrast ? "text-gray-200" : "text-gray-500"}`}>
                          Tap once to start recording, tap again to stop
                        </p>
                      )}

                      {isRecording && (
                        <p className={`mt-4 text-sm font-medium ${highContrast ? "text-white" : ""}`}>
                          Recording... {Math.round(recordingProgress / (100 / 30))}s / 30s
                        </p>
                      )}
                    </div>

                    {/* Recording progress bar */}
                    {isRecording && (
                      <div className="space-y-2">
                        <Progress
                          value={recordingProgress}
                          className={`h-2 ${highContrast ? "bg-blue-800" : ""}`}
                          indicatorClassName={highContrast ? "bg-white" : ""}
                        />
                      </div>
                    )}

                    {/* Alternative: Upload audio file */}
                    <div className="flex flex-col items-center">
                      <p className={`text-sm mb-2 ${highContrast ? "text-gray-200" : "text-gray-500"}`}>
                        Or upload an existing audio file:
                      </p>
                      <input
                        ref={audioFileInputRef}
                        type="file"
                        accept="audio/mp3,audio/wav,audio/mp4,audio/*"
                        className="hidden"
                        onChange={handleAudioFileUpload}
                        id="audio-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => audioFileInputRef.current?.click()}
                        className={`${highContrast ? "border-white text-white hover:bg-blue-800" : ""}`}
                      >
                        <FileAudio className="mr-2 h-4 w-4" />
                        Add Audio File (.mp3, .wav, .mp4)
                      </Button>
                    </div>

                    {/* Playback if recording is complete */}
                    {recordingComplete && audioUrl && (
                      <div
                        className={`p-3 md:p-4 rounded-lg ${highContrast ? "bg-blue-800" : "bg-gray-50 dark:bg-gray-900/20"}`}
                      >
                        <p className={`font-medium mb-2 text-sm md:text-base ${highContrast ? "text-white" : ""}`}>
                          Your recording:
                        </p>
                        <audio controls className="w-full mb-3 md:mb-4">
                          <source src={audioUrl} type="audio/wav" />
                          Your browser does not support the audio element.
                        </audio>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadAudio}
                            className={`text-xs md:text-sm ${highContrast ? "border-white text-white hover:bg-blue-800" : ""}`}
                          >
                            <Download className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                            Download as WAV
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant={highContrast ? "outline" : "ghost"}
                      onClick={resetAssessment}
                      className={`text-xs md:text-sm px-2 md:px-4 ${highContrast ? "border-white text-white hover:bg-blue-800" : ""}`}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      disabled={!recordingComplete}
                      className={`text-xs md:text-sm px-2 md:px-4 ${highContrast ? "bg-white text-blue-950 hover:bg-gray-200" : ""}`}
                    >
                      Next <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Handwriting Task */}
              <TabsContent value="handwriting">
                <Card className={highContrast ? "bg-blue-900 border-white text-white" : ""}>
                  <CardHeader>
                    <CardTitle className={highContrast ? "text-white" : ""}>Handwriting Assessment</CardTitle>
                    <CardDescription className={highContrast ? "text-gray-200" : ""}>
                      Write a sentence and upload a photo of your handwriting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className={`border rounded-lg p-6 ${highContrast ? "border-white" : ""}`}>
                      <h3 className={`text-lg font-medium mb-4 ${highContrast ? "text-white" : ""}`}>Instructions:</h3>
                      <ol className={`list-decimal pl-5 space-y-3 ${highContrast ? "text-white" : ""}`}>
                        <li>Take a blank 8.5 x 11 inch piece of paper</li>
                        <li>
                          Write the following sentence: <strong>"The quick brown fox jumps over the lazy dog."</strong>
                        </li>
                        <li>Take a clear photo of your handwriting</li>
                        <li>Upload the photo using the button below</li>
                      </ol>
                    </div>

                    <div className="flex flex-col items-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        id="handwriting-upload"
                      />

                      {!handwritingImage ? (
                        <Button
                          className={`h-16 px-6 ${highContrast ? "bg-white text-blue-950 hover:bg-gray-200" : ""}`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Camera className="mr-2 h-6 w-6" />
                          Upload Handwriting Photo
                        </Button>
                      ) : (
                        <div className="w-full space-y-4">
                          <div className="relative aspect-video w-full max-w-md mx-auto border rounded-lg overflow-hidden">
                            <img
                              src={handwritingImage || "/placeholder.svg"}
                              alt="Your handwriting sample"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className={highContrast ? "border-white text-white hover:bg-blue-800" : ""}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Different Image
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant={highContrast ? "outline" : "ghost"}
                      onClick={goToPreviousStep}
                      className={highContrast ? "border-white text-white hover:bg-blue-800" : ""}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      disabled={!handwritingComplete}
                      className={highContrast ? "bg-white text-blue-950 hover:bg-gray-200" : ""}
                    >
                      Next Task <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Reaction Time Test */}
              <TabsContent value="reaction">
                <Card className={highContrast ? "bg-blue-900 border-white text-white" : ""}>
                  <CardHeader>
                    <CardTitle className={highContrast ? "text-white" : ""}>Reaction Time Test</CardTitle>
                    <CardDescription className={highContrast ? "text-gray-200" : ""}>
                      Test your reaction time by tapping when the circle turns green
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <p className={`text-lg font-medium mb-2 ${highContrast ? "text-white" : ""}`}>
                        {reactionState === "waiting" && "Tap the circle to begin"}
                        {reactionState === "ready" && "Wait for green..."}
                        {reactionState === "active" && "TAP NOW!"}
                        {reactionState === "complete" && "Test complete!"}
                      </p>
                      <p className={`text-sm ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                        Complete 5 attempts for accurate results
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <button
                        className={`${isMobile ? "w-36 h-36" : "w-48 h-48"} rounded-full flex items-center justify-center transition-all ${
                          reactionState === "active"
                            ? highContrast
                              ? "bg-green-500 text-white"
                              : "bg-green-500 text-white"
                            : reactionState === "ready"
                              ? highContrast
                                ? "bg-yellow-500 text-white"
                                : "bg-yellow-500 text-white"
                              : highContrast
                                ? "bg-white text-blue-950"
                                : "bg-gray-200 dark:bg-gray-700"
                        }`}
                        onClick={handleReactionClick}
                        disabled={reactionState === "complete"}
                        aria-label="Reaction test button"
                      >
                        {reactionState === "waiting" && <Clock className={isMobile ? "h-12 w-12" : "h-16 w-16"} />}
                        {reactionState === "ready" && <span className={isMobile ? "text-sm" : ""}>Wait...</span>}
                        {reactionState === "active" && (
                          <span className={isMobile ? "text-xl font-bold" : "text-2xl font-bold"}>TAP!</span>
                        )}
                        {reactionState === "complete" && (
                          <CheckCircle2 className={isMobile ? "h-12 w-12" : "h-16 w-16"} />
                        )}
                      </button>
                    </div>

                    <div
                      className={`p-4 rounded-lg ${highContrast ? "bg-blue-800" : "bg-gray-50 dark:bg-gray-900/20"}`}
                    >
                      <h3 className={`font-medium mb-3 ${highContrast ? "text-white" : ""}`}>Results:</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}>
                            Attempts:
                          </span>
                          <span className={`font-medium ${highContrast ? "text-white" : ""}`}>
                            {reactionTimes.length}/5
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}>
                            Average reaction time:
                          </span>
                          <span className={`font-medium ${highContrast ? "text-white" : ""}`}>
                            {averageReactionTime ? `${averageReactionTime}ms` : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}>
                            Previous result:
                          </span>
                          <span className={`font-medium ${highContrast ? "text-white" : ""}`}>
                            {previousReactionTime ? `${previousReactionTime}ms` : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}>
                            Change:
                          </span>
                          <span
                            className={`font-medium ${
                              averageReactionTime && previousReactionTime
                                ? averageReactionTime < previousReactionTime
                                  ? "text-green-500"
                                  : "text-red-500"
                                : ""
                            } ${highContrast ? "text-white" : ""}`}
                          >
                            {averageReactionTime && previousReactionTime
                              ? averageReactionTime < previousReactionTime
                                ? `↓ ${previousReactionTime - averageReactionTime}ms faster`
                                : `↑ ${averageReactionTime - previousReactionTime}ms slower`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant={highContrast ? "outline" : "ghost"}
                      onClick={goToPreviousStep}
                      className={`text-xs md:text-sm px-2 md:px-4 ${highContrast ? "border-white text-white hover:bg-blue-800" : ""}`}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      onClick={goToNextStep}
                      disabled={reactionState !== "complete"}
                      className={`text-xs md:text-sm px-2 md:px-4 ${highContrast ? "bg-white text-blue-950 hover:bg-gray-200" : ""}`}
                    >
                      Next Task <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Summary Screen */}
              <TabsContent value="summary">
                <Card className={highContrast ? "bg-blue-900 border-white text-white" : ""}>
                  <CardHeader>
                    <CardTitle className={highContrast ? "text-white" : ""}>Assessment Complete</CardTitle>
                    <CardDescription className={highContrast ? "text-gray-200" : ""}>
                      Your weekly cognitive assessment has been completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className={`p-6 rounded-lg text-center ${highContrast ? "bg-blue-800" : "bg-purple-50 dark:bg-purple-900/20"}`}
                    >
                      <CheckCircle2
                        className={`h-16 w-16 mx-auto mb-4 ${highContrast ? "text-white" : "text-green-600 dark:text-green-400"}`}
                      />
                      <h3 className={`text-xl font-bold mb-2 ${highContrast ? "text-white" : ""}`}>
                        Your weekly assessment is complete!
                      </h3>
                      <p className={`mb-4 ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                        Results have been sent to your doctor for review.
                      </p>
                    </div>

                    <div className={`border rounded-lg p-4 ${highContrast ? "border-white" : ""}`}>
                      <h3 className={`font-medium mb-3 ${highContrast ? "text-white" : ""}`}>Assessment Summary:</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${highContrast ? "bg-white text-blue-950" : "bg-primary/20 text-primary"}`}
                          >
                            <Mic className="h-3 w-3" />
                          </div>
                          <div>
                            <p className={`font-medium ${highContrast ? "text-white" : ""}`}>Speech Analysis</p>
                            <p
                              className={`text-sm ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}
                            >
                              Recording analyzed for speech patterns and clarity
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${highContrast ? "bg-white text-blue-950" : "bg-primary/20 text-primary"}`}
                          >
                            <Camera className="h-3 w-3" />
                          </div>
                          <div>
                            <p className={`font-medium ${highContrast ? "text-white" : ""}`}>Handwriting Assessment</p>
                            <p
                              className={`text-sm ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}
                            >
                              Handwriting sample analyzed for tremor and control
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${highContrast ? "bg-white text-blue-950" : "bg-primary/20 text-primary"}`}
                          >
                            <Clock className="h-3 w-3" />
                          </div>
                          <div>
                            <p className={`font-medium ${highContrast ? "text-white" : ""}`}>Reaction Time Test</p>
                            <p
                              className={`text-sm ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}
                            >
                              Average reaction time:{" "}
                              {averageReactionTime ? `${averageReactionTime}ms` : "Not completed"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className={`text-sm ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                        Your next assessment will be available in 7 days.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant={highContrast ? "outline" : "ghost"}
                      onClick={goToPreviousStep}
                      className={`text-xs md:text-sm px-2 md:px-4 ${highContrast ? "border-white text-white hover:bg-blue-800" : ""}`}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      onClick={() => (window.location.href = "/dashboard")}
                      className={`text-xs md:text-sm px-2 md:px-4 ${highContrast ? "bg-white text-blue-950 hover:bg-gray-200" : ""}`}
                    >
                      Return to Dashboard
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer
        className={`flex flex-col gap-2 sm:flex-row py-4 sm:py-6 w-full shrink-0 items-center px-4 md:px-6 border-t ${highContrast ? "bg-blue-950 border-white text-white" : ""}`}
      >
        <p className={`text-xs ${highContrast ? "text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
          © 2025 ParkinTrack. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a className={`text-xs hover:underline underline-offset-4 ${highContrast ? "text-white" : ""}`} href="#">
            Terms of Service
          </a>
          <a className={`text-xs hover:underline underline-offset-4 ${highContrast ? "text-white" : ""}`} href="#">
            Privacy
          </a>
        </nav>
      </footer>
    </div>
  )
}

