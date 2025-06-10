"use client"

import { motion } from "framer-motion"
import { Bot, Sparkles, Brain, MessageCircle } from "lucide-react"
import { VibrantCard } from "@/components/ui/vibrant-card"

interface AnimatedChatLoaderProps {
  stage?: "thinking" | "processing" | "responding"
}

export function AnimatedChatLoader({ stage = "thinking" }: AnimatedChatLoaderProps) {
  const getStageInfo = () => {
    switch (stage) {
      case "thinking":
        return {
          icon: Brain,
          message: "AI is thinking...",
          color: "text-vibrant-purple",
          bgColor: "bg-vibrant-purple/10",
        }
      case "processing":
        return {
          icon: Sparkles,
          message: "Processing your request...",
          color: "text-vibrant-blue",
          bgColor: "bg-vibrant-blue/10",
        }
      case "responding":
        return {
          icon: MessageCircle,
          message: "Preparing response...",
          color: "text-vibrant-teal",
          bgColor: "bg-vibrant-teal/10",
        }
    }
  }

  const stageInfo = getStageInfo()
  const Icon = stageInfo.icon

  return (
    <div className="flex gap-3 mb-6">
      {/* AI Avatar */}
      <motion.div
        className={`w-8 h-8 rounded-full ${stageInfo.bgColor} flex items-center justify-center`}
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0 0 rgba(139,92,246,0)",
            "0 0 0 8px rgba(139,92,246,0.1)",
            "0 0 0 0 rgba(139,92,246,0)",
          ],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <Bot className={`w-4 h-4 ${stageInfo.color}`} />
      </motion.div>

      {/* Loading Content */}
      <div className="flex-1">
        <VibrantCard variant="outline" className="p-4 relative overflow-hidden">
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.1), transparent)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10 flex items-center space-x-3">
            {/* Animated Icon */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                scale: { duration: 1, repeat: Number.POSITIVE_INFINITY },
              }}
            >
              <Icon className={`w-5 h-5 ${stageInfo.color}`} />
            </motion.div>

            {/* Animated Text */}
            <div className="flex-1">
              <motion.p
                className={`text-sm font-medium ${stageInfo.color}`}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                {stageInfo.message}
              </motion.p>

              {/* Animated dots */}
              <div className="flex space-x-1 mt-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full ${stageInfo.bgColor.replace('/10', '/40')}`}
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pulse animation on the right */}
            <motion.div
              className={`w-3 h-3 rounded-full ${stageInfo.color.replace('text-', 'bg-')}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.3, 1],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          </div>
        </VibrantCard>
      </div>
    </div>
  )
}

// Alternative simplified typing loader
export function TypingLoader() {
  return (
    <div className="flex gap-3 mb-6">
      <motion.div
        className="w-8 h-8 rounded-full bg-vibrant-purple/10 flex items-center justify-center"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <Bot className="w-4 h-4 text-vibrant-purple" />
      </motion.div>

      <div className="flex-1">
        <VibrantCard variant="outline" className="p-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">AI is typing</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-vibrant-purple/40 rounded-full"
                  animate={{
                    y: [-2, -8, -2],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: index * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        </VibrantCard>
      </div>
    </div>
  )
} 