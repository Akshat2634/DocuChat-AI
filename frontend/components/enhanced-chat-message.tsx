"use client"

import { motion } from "framer-motion"
import type { ChatMessage as ChatMessageType } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface EnhancedChatMessageProps {
  message: ChatMessageType
}

export function EnhancedChatMessage({ message }: EnhancedChatMessageProps) {
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
        </motion.div>
      )}

      <div className={cn("max-w-[80%] space-y-2", isUser ? "items-end" : "items-start")}>
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
          <Card
            className={cn(
              "p-4 shadow-md hover:shadow-lg transition-all duration-300",
              isUser
                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                : "bg-muted/50 hover:bg-muted/70 border-2",
            )}
          >
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
          </Card>
        </motion.div>

        <div className="flex items-center justify-between">
          <div
            className={cn(
              "text-xs opacity-70 flex items-center space-x-1",
              isUser ? "text-primary/70" : "text-muted-foreground",
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
            <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-6 w-6 p-0 hover:bg-background/20">
              <Copy className="h-3 w-3" />
            </Button>

            {!isUser && (
              <>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background/20">
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background/20">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {isUser && (
        <motion.div className="flex-shrink-0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center shadow-lg border-2">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
