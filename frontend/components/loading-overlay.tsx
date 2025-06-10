"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Upload, FileText, MessageSquare } from "lucide-react"

interface LoadingOverlayProps {
  isVisible: boolean
  stage: "uploading" | "processing" | "complete"
  progress: number
  fileCount?: number
}

export function LoadingOverlay({ isVisible, stage, progress, fileCount = 0 }: LoadingOverlayProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (isVisible) {
      const timer = setInterval(() => {
        setDisplayProgress((prev) => {
          if (prev < progress) {
            return Math.min(prev + 2, progress)
          }
          return prev
        })
      }, 50)
      return () => clearInterval(timer)
    }
  }, [isVisible, progress])

  if (!isVisible) return null

  const getStageInfo = () => {
    switch (stage) {
      case "uploading":
        return {
          icon: <Upload className="w-8 h-8 text-primary animate-bounce" />,
          title: "Uploading Documents",
          description: `Uploading ${fileCount} document${fileCount !== 1 ? "s" : ""}...`,
        }
      case "processing":
        return {
          icon: <FileText className="w-8 h-8 text-primary animate-pulse" />,
          title: "Processing Documents",
          description: "Analyzing content and preparing for chat...",
        }
      case "complete":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          title: "Ready to Chat",
          description: "Your documents are ready for conversation!",
        }
    }
  }

  const stageInfo = getStageInfo()

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-2">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">{stageInfo.icon}</div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{stageInfo.title}</h3>
            <p className="text-muted-foreground">{stageInfo.description}</p>
          </div>

          <div className="space-y-2">
            <Progress value={displayProgress} className="w-full h-2" />
            <p className="text-sm text-muted-foreground">{displayProgress}% complete</p>
          </div>

          {stage === "complete" && (
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Redirecting to chat...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
