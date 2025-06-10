"use client"

import { motion } from "framer-motion"
import type { ChatMessage as ChatMessageType } from "@/lib/api"
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { VibrantButton } from "@/components/ui/vibrant-button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface VibrantChatMessageProps {
  message: ChatMessageType
}

export function VibrantChatMessage({ message }: VibrantChatMessageProps) {
  const isUser = message.role === "user"
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message content.",
        variant: "destructive",
      })
    }
  }

  return (
    <motion.div
      className={cn("flex gap-4 mb-6 group", isUser ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isUser && (
        <motion.div className="flex-shrink-0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vibrant-purple to-vibrant-blue flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      )}

      <div className={cn("max-w-[80%] space-y-2", isUser ? "items-end" : "items-start")}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative group"
        >
          <div
            className={cn(
              "p-4 rounded-xl shadow-md transition-all duration-300",
              isUser
                ? "bg-gradient-to-br from-vibrant-purple to-vibrant-blue text-white"
                : "bg-card border-2 border-muted hover:border-vibrant-purple/20",
            )}
          >
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>

            {/* Subtle glow effect on hover */}
            {!isUser && (
              <motion.div
                className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100"
                initial={false}
                animate={{
                  boxShadow: ["0 0 0px rgba(139,92,246,0)", "0 0 10px rgba(139,92,246,0.1)"],
                }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        </motion.div>

        <div className="flex items-center justify-between">
          <div
            className={cn(
              "text-xs opacity-70 flex items-center space-x-1",
              isUser ? "text-vibrant-purple" : "text-muted-foreground",
            )}
          >
            <span>{message.timestamp.toLocaleTimeString()}</span>
          </div>

          {/* Action buttons */}
          <motion.div
            className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <VibrantButton
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 w-6 p-0 hover:bg-vibrant-purple/10 hover:text-vibrant-purple"
            >
              <Copy className="h-3 w-3" />
            </VibrantButton>

            {!isUser && (
              <>
                <VibrantButton
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-vibrant-green/10 hover:text-vibrant-green"
                >
                  <ThumbsUp className="h-3 w-3" />
                </VibrantButton>
                <VibrantButton
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <ThumbsDown className="h-3 w-3" />
                </VibrantButton>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {isUser && (
        <motion.div className="flex-shrink-0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center shadow-lg border-2 border-muted">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
