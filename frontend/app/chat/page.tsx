"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { VibrantButton } from "@/components/ui/vibrant-button"
import { VibrantCard } from "@/components/ui/vibrant-card"
import { VibrantChatMessage } from "@/components/vibrant-chat-message"
import { VibrantChatInput } from "@/components/vibrant-chat-input"
import { AnimatedBackground } from "@/components/animated-background"
import { ChatMessageSkeleton } from "@/components/loading-skeleton"
import { AnimatedChatLoader } from "@/components/animated-chat-loader"
import { ThemeToggle } from "@/components/theme-toggle"
import { type ChatMessage as ChatMessageType, sendChatMessage } from "@/lib/api"
import { getSessionId } from "@/lib/session"
import { MessageSquare, ArrowLeft, FileText, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const [loadingStage, setLoadingStage] = useState<"thinking" | "processing" | "responding">("thinking")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const id = getSessionId()
    setSessionId(id)

    // Add welcome message with animation delay
    setTimeout(() => {
      const welcomeMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        content: "Hello! I'm ready to help you explore your documents. What would you like to know?",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }, 500)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      content,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsTyping(true)
    setLoadingStage("thinking")

    try {
      // Thinking stage
      await new Promise((resolve) => setTimeout(resolve, 800))
      setLoadingStage("processing")

      // Processing stage
      await new Promise((resolve) => setTimeout(resolve, 500))
      setLoadingStage("responding")

      // Make API call
      const response = await sendChatMessage(content, sessionId)

      setIsTyping(false)

      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        content: response.success
          ? response.response || "I'm sorry, I couldn't process your request."
          : response.message,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (!response.success) {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setIsTyping(false)
      const errorMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        content: "I'm sorry, there was an error processing your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Connection Error",
        description: "Failed to send message. Please check your connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Animated background */}
      <AnimatedBackground variant="chat" />

      {/* Header */}
      <motion.header
        className="border-b bg-background/80 backdrop-blur-sm z-40 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <VibrantButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="flex items-center space-x-2 hover:bg-vibrant-purple/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </VibrantButton>
              </motion.div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <MessageSquare className="h-6 w-6 text-vibrant-purple" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-vibrant-green rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-vibrant-purple to-vibrant-blue bg-clip-text text-transparent">
                  DocuChat AI
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center space-x-2 text-sm bg-vibrant-green/10 text-vibrant-green px-3 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <FileText className="h-4 w-4" />
                <span>Documents Ready</span>
              </motion.div>

              <div className="text-sm font-mono bg-muted/50 px-3 py-1 rounded-full">
                <span className="text-vibrant-purple">{sessionId.slice(0, 8)}...</span>
              </div>

              <ThemeToggle />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VibrantChatMessage message={message} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Animated typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedChatLoader stage={loadingStage} />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <motion.div
          className="border-t bg-background/80 backdrop-blur-sm"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <VibrantChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />

            {/* Quick suggestions */}
            {messages.length === 1 && (
              <motion.div
                className="mt-4 flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[
                  "Summarize the main points",
                  "What are the key findings?",
                  "Extract important dates",
                  "Find action items",
                ].map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs px-3 py-1 bg-vibrant-purple/10 hover:bg-vibrant-purple/20 text-vibrant-purple rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Status indicators */}
      <motion.div
        className="fixed bottom-4 right-4 z-50 space-y-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* AI Status */}
        <VibrantCard variant="green" className="p-3 shadow-lg">
          <div className="flex items-center space-x-2 text-xs">
            <motion.div
              className="w-2 h-2 bg-vibrant-green rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            />
            <span className="text-vibrant-green font-medium">AI Online</span>
          </div>
        </VibrantCard>

        {/* Performance indicator */}
        <VibrantCard variant="blue" className="p-3 shadow-lg">
          <div className="flex items-center space-x-2 text-xs">
            <Zap className="w-3 h-3 text-vibrant-blue" />
            <span className="text-vibrant-blue font-medium">Fast Response</span>
          </div>
        </VibrantCard>
      </motion.div>
    </div>
  )
}
