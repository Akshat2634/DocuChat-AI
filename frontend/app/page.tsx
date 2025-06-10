"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { VibrantButton } from "@/components/ui/vibrant-button"
import { VibrantCard } from "@/components/ui/vibrant-card"
import { VibrantFileUpload } from "@/components/vibrant-file-upload"
import { AnimatedBackground } from "@/components/animated-background"
import { ThemeToggle } from "@/components/theme-toggle"
import { uploadDocuments } from "@/lib/api"
import { getSessionId } from "@/lib/session"
import type { FileWithPreview } from "@/lib/file-utils"
import { MessageSquare, Upload, Zap, Sparkles, ArrowRight, FileText, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStage, setUploadStage] = useState<"idle" | "uploading" | "processing" | "complete">("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [sessionId, setSessionId] = useState<string>("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  const simulateProgress = (stage: "uploading" | "processing", onComplete: () => void) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setTimeout(onComplete, 500)
      }
      setUploadProgress(progress)
    }, 200)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadStage("uploading")
    setUploadProgress(0)

    // Simulate upload progress
    simulateProgress("uploading", () => {
      setUploadStage("processing")
      setUploadProgress(0)

      // Simulate processing
      simulateProgress("processing", async () => {
        try {
          const response = await uploadDocuments(selectedFiles, sessionId)

          if (response.success) {
            setUploadStage("complete")
            setUploadProgress(100)

            toast({
              title: "Upload successful",
              description: `${selectedFiles.length} document(s) uploaded successfully.`,
            })

            // Redirect after showing completion
            setTimeout(() => {
              router.push("/chat")
            }, 1500)
          } else {
            throw new Error(response.message)
          }
        } catch (error) {
          setIsUploading(false)
          setUploadStage("idle")
          toast({
            title: "Upload failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          })
        }
      })
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <AnimatedBackground />

      {/* Loading overlay */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <VibrantCard variant="purple" className="w-full max-w-md mx-4 p-8" glowEffect>
            <div className="text-center space-y-6">
              <motion.div
                className="flex justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: uploadStage === "uploading" ? [0, 360] : 0,
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                {uploadStage === "uploading" && <Upload className="w-12 h-12 text-vibrant-purple" />}
                {uploadStage === "processing" && <FileText className="w-12 h-12 text-vibrant-blue" />}
                {uploadStage === "complete" && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                    <MessageSquare className="w-12 h-12 text-vibrant-green" />
                  </motion.div>
                )}
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {uploadStage === "uploading" && "Uploading Documents"}
                  {uploadStage === "processing" && "Processing Documents"}
                  {uploadStage === "complete" && "Ready to Chat"}
                </h3>
                <p className="text-muted-foreground">
                  {uploadStage === "uploading" &&
                    `Uploading ${selectedFiles.length} document${selectedFiles.length !== 1 ? "s" : ""}...`}
                  {uploadStage === "processing" && "Analyzing content and preparing for chat..."}
                  {uploadStage === "complete" && "Your documents are ready for conversation!"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-vibrant-purple to-vibrant-blue"
                    initial={{ width: "0%" }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
              </div>

              {uploadStage === "complete" && (
                <motion.div
                  className="flex items-center justify-center space-x-2 text-vibrant-green"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Redirecting to chat...</span>
                </motion.div>
              )}
            </div>
          </VibrantCard>
        </motion.div>
      )}

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <MessageSquare className="h-8 w-8 text-vibrant-purple" />
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-vibrant-purple rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-vibrant-purple to-vibrant-blue bg-clip-text text-transparent">
                DocuChat AI
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              <motion.div
                className="text-sm font-mono bg-muted/50 px-3 py-1 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-vibrant-purple">{sessionId.slice(0, 8)}...</span>
              </motion.div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <motion.div className="max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero Section */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <motion.div
              className="inline-flex items-center space-x-2 bg-vibrant-purple/10 text-vibrant-purple px-4 py-2 rounded-full text-sm font-medium mb-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Document Intelligence</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 gradient-text from-vibrant-purple via-vibrant-blue to-vibrant-teal">
              Unlock Knowledge from Your Documents
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload your documents and start an intelligent conversation. Get instant answers, insights, and summaries
              powered by RAG (Retrieval-Augmented Generation) and LanceDB vector database technology.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div className="grid md:grid-cols-3 gap-6 mb-16" variants={itemVariants}>
            {[
              {
                icon: Upload,
                title: "Easy Upload",
                description: "Drag and drop multiple documents or browse to select files",
                color: "text-vibrant-blue",
                variant: "blue",
              },
              {
                icon: Zap,
                title: "Instant Insights",
                description: "Get immediate answers and analysis from your document content",
                color: "text-vibrant-yellow",
                variant: "orange",
              },
              {
                icon: Lock,
                title: "Secure & Private",
                description: "Your documents are processed securely with enterprise-grade privacy",
                color: "text-vibrant-green",
                variant: "green",
              },
            ].map((feature) => (
              <motion.div key={feature.title} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <VibrantCard variant={feature.variant as any} className="h-full" glowEffect>
                  <div className="text-center space-y-4">
                    <motion.div className="mx-auto" whileHover={{ rotate: 5 }} transition={{ duration: 0.2 }}>
                      <feature.icon className={`h-10 w-10 ${feature.color}`} />
                    </motion.div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </VibrantCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Upload Section */}
          <motion.div variants={itemVariants}>
            <VibrantCard variant="purple" className="mb-8" glowEffect>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-vibrant-purple" />
                  <h3 className="text-xl font-semibold">Upload Your Documents</h3>
                </div>
                <p className="text-muted-foreground">
                  Select the documents you'd like to chat with. We support PDF, DOCX, and TXT files.
                </p>
                <VibrantFileUpload
                  onFilesSelected={setSelectedFiles}
                  selectedFiles={selectedFiles}
                  isUploading={isUploading}
                />
              </div>
            </VibrantCard>
          </motion.div>

          {/* Action Button */}
          <motion.div className="text-center" variants={itemVariants}>
            <VibrantButton
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              size="xl"
              variant="purple"
              isLoading={isUploading}
            >
              {!isUploading && (
                <>
                  Start Chatting
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </VibrantButton>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
