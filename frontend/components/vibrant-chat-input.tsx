"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { VibrantButton } from "@/components/ui/vibrant-button"
import { Send, Mic, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"

interface VibrantChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export function VibrantChatInput({ onSendMessage, isLoading }: VibrantChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "60px" // Reset height
      const scrollHeight = textarea.scrollHeight
      textarea.style.height = `${scrollHeight}px`
    }
  }, [message])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className="relative flex items-end rounded-xl border-2 focus-within:border-vibrant-purple transition-colors bg-card overflow-hidden"
          animate={isLoading ? {
            boxShadow: [
              "0 0 0 0 rgba(139,92,246,0)",
              "0 0 0 2px rgba(139,92,246,0.2)",
              "0 0 0 0 rgba(139,92,246,0)",
            ],
          } : {}}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your documents..."
            className={cn(
              "flex-1 min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent p-4 pr-16 focus:outline-none focus:ring-0",
              isLoading && "opacity-50",
            )}
            disabled={isLoading}
            rows={1}
          />

          {/* Send button */}
          <div className="absolute bottom-3 right-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <VibrantButton
                type="submit"
                variant={message.trim() ? "purple" : "outline"}
                size="icon"
                disabled={!message.trim() || isLoading}
                className="rounded-full h-9 w-9"
              >
                {isLoading ? (
                  <motion.div
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                )}
              </VibrantButton>
            </motion.div>
          </div>

          {/* Gradient border animation on focus */}
          <motion.div
            className="absolute inset-0 -z-10 opacity-0 pointer-events-none"
            animate={{
              opacity: [0, 0.5, 0],
              boxShadow: ["0 0 0 0 rgba(139,92,246,0)", "0 0 0 2px rgba(139,92,246,0.2)", "0 0 0 0 rgba(139,92,246,0)"],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>

        {/* AI Disclaimer */}
        <div className="mt-4 px-2 text-center">
          <motion.p
            className="text-xs text-gray-400 opacity-60 font-thin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
          >
            AI can make mistakes. Please double-check responses.
          </motion.p>
        </div>
      </form>
    </motion.div>
  )
}
