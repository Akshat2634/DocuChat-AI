"use client"

import { motion } from "framer-motion"
import { useTheme } from "@/lib/theme"
import { cn } from "@/lib/utils"

interface AnimatedBackgroundProps {
  variant?: "default" | "chat" | "minimal"
  className?: string
}

export function AnimatedBackground({ variant = "default", className }: AnimatedBackgroundProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {/* Purple blob */}
      <motion.div
        className={cn(
          "absolute rounded-full blur-3xl opacity-20 bg-vibrant-purple",
          variant === "default" ? "-top-40 -right-40 w-96 h-96" : "top-1/4 -right-20 w-80 h-80",
        )}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: isDark ? [0.15, 0.25, 0.15] : [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Blue blob */}
      <motion.div
        className={cn(
          "absolute rounded-full blur-3xl opacity-20 bg-vibrant-blue",
          variant === "default" ? "-bottom-40 -left-40 w-96 h-96" : "bottom-1/4 -left-20 w-80 h-80",
        )}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
          opacity: isDark ? [0.15, 0.25, 0.15] : [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Teal accent */}
      {variant === "default" && (
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 bg-vibrant-teal"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            opacity: isDark ? [0.1, 0.15, 0.1] : [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Pink accent */}
      {variant !== "minimal" && (
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-10 bg-vibrant-pink"
          animate={{
            scale: [1.2, 0.8, 1.2],
            y: [0, 30, 0],
            opacity: isDark ? [0.1, 0.15, 0.1] : [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), 
                           linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  )
}
