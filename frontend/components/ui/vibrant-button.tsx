"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const vibrantButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-vibrant-purple to-vibrant-blue text-white shadow-lg hover:shadow-xl",
        purple: "bg-gradient-to-r from-vibrant-purple to-vibrant-pink text-white shadow-lg hover:shadow-xl",
        blue: "bg-gradient-to-r from-vibrant-blue to-vibrant-teal text-white shadow-lg hover:shadow-xl",
        green: "bg-gradient-to-r from-vibrant-teal to-vibrant-green text-white shadow-lg hover:shadow-xl",
        orange: "bg-gradient-to-r from-vibrant-orange to-vibrant-yellow text-white shadow-lg hover:shadow-xl",
        outline: "border-2 border-vibrant-purple text-foreground bg-transparent hover:bg-vibrant-purple/10",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface VibrantButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof vibrantButtonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const VibrantButton = React.forwardRef<HTMLButtonElement, VibrantButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <motion.div
        whileHover={{ scale: props.disabled ? 1 : 1.03 }}
        whileTap={{ scale: props.disabled ? 1 : 0.97 }}
        className="inline-block"
      >
        <Comp
          className={cn(vibrantButtonVariants({ variant, size, className }), "button-gradient")}
          ref={ref}
          {...props}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-inherit">
              <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <span className={cn(isLoading && "opacity-0")}>{children}</span>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-10" />
        </Comp>
      </motion.div>
    )
  },
)
VibrantButton.displayName = "VibrantButton"

export { VibrantButton, vibrantButtonVariants }
