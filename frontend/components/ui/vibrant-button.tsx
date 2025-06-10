"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const vibrantButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden gap-2",
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
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-lg px-8 text-base font-semibold",
        xl: "h-14 rounded-lg px-10 text-lg font-semibold",
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
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {children}
            </div>
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-10" />
        </Comp>
      </motion.div>
    )
  },
)
VibrantButton.displayName = "VibrantButton"

export { VibrantButton, vibrantButtonVariants }
