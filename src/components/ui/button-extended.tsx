import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-surface-primary text-surface-primary-foreground hover:bg-interactive-primary-hover shadow-soft hover:shadow-medium",
        secondary: "bg-surface-secondary text-surface-secondary-foreground hover:bg-surface-muted border border-border",
        hero: "bg-gradient-hero text-surface-primary-foreground hover:shadow-glow transition-all duration-500 font-semibold",
        whatsapp: "bg-interactive-secondary text-surface-primary-foreground hover:bg-interactive-secondary-hover shadow-soft hover:shadow-medium",
        accent: "bg-interactive-accent text-surface-primary-foreground hover:bg-opacity-90 shadow-soft",
        outline: "border border-border bg-background hover:bg-surface-muted text-foreground",
        ghost: "hover:bg-surface-muted text-foreground",
        link: "text-interactive-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-6 py-2",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }