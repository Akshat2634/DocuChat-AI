"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface VibrantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "purple" | "blue" | "green" | "orange" | "pink" | "teal"
  glowEffect?: boolean
  hoverEffect?: boolean
  children: React.ReactNode
}

export function VibrantCard({
  className,
  variant = "default",
  glowEffect = false,
  hoverEffect = true,
  children,
  ...props
}: VibrantCardProps) {
  const getGradientClass = () => {
    switch (variant) {
      case "purple":
        return "from-vibrant-purple/20 to-transparent"
      case "blue":
        return "from-vibrant-blue/20 to-transparent"
      case "green":
        return "from-vibrant-green/20 to-transparent"
      case "orange":
        return "from-vibrant-orange/20 to-transparent"
      case "pink":
        return "from-vibrant-pink/20 to-transparent"
      case "teal":
        return "from-vibrant-teal/20 to-transparent"
      default:
        return "from-vibrant-purple/10 to-transparent"
    }
  }

  const getBorderClass = () => {
    switch (variant) {
      case "purple":
        return "border-vibrant-purple/30"
      case "blue":
        return "border-vibrant-blue/30"
      case "green":
        return "border-vibrant-green/30"
      case "orange":
        return "border-vibrant-orange/30"
      case "pink":
        return "border-vibrant-pink/30"
      case "teal":
        return "border-vibrant-teal/30"
      default:
        return "border-border"
    }
  }

  const getGlowClass = () => {
    if (!glowEffect) return ""

    switch (variant) {
      case "purple":
        return "shadow-[0_0_15px_rgba(139,92,246,0.15)]"
      case "blue":
        return "shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      case "green":
        return "shadow-[0_0_15px_rgba(34,197,94,0.15)]"
      case "orange":
        return "shadow-[0_0_15px_rgba(249,115,22,0.15)]"
      case "pink":
        return "shadow-[0_0_15px_rgba(236,72,153,0.15)]"
      case "teal":
        return "shadow-[0_0_15px_rgba(20,184,166,0.15)]"
      default:
        return "shadow-[0_0_15px_rgba(139,92,246,0.1)]"
    }
  }

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-lg border bg-card p-6 relative overflow-hidden",
        getBorderClass(),
        getGlowClass(),
        className,
      )}
      {...props}
    >
      {/* Gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", getGradientClass())} />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-shimmer transition-opacity duration-700" />
    </motion.div>
  )
}
