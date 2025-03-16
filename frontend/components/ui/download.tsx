"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface DownloadButtonProps {
  blob: Blob
  filename: string
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

export function DownloadButton({
  blob,
  filename,
  className,
  variant = "outline",
  size = "sm",
  children,
}: DownloadButtonProps) {
  const isMobile = useIsMobile()

  const handleDownload = () => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()

    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      className={cn(isMobile ? "text-xs py-1 px-2" : "", className)}
    >
      <Download className={isMobile ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4"} />
      {children || (isMobile ? `Download` : `Download ${filename}`)}
    </Button>
  )
}

