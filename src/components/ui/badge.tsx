import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30 [a&]:hover:bg-primary/30 [a&]:hover:border-primary/50",
        secondary:
          "bg-gradient-to-r from-secondary/20 to-secondary/10 text-secondary border-secondary/30 [a&]:hover:bg-secondary/30 [a&]:hover:border-secondary/50",
        destructive:
          "bg-destructive/20 text-destructive border-destructive/30 [a&]:hover:bg-destructive/30 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent/20 [a&]:hover:text-accent-foreground",
        ghost: "border-transparent [a&]:hover:bg-accent/20 [a&]:hover:text-accent-foreground",
        link: "text-primary border-transparent underline-offset-4 [a&]:hover:underline",
        success:
          "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 [a&]:hover:bg-emerald-500/30",
        warning:
          "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 [a&]:hover:bg-amber-500/30",
        info:
          "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30 [a&]:hover:bg-blue-500/30",
        error:
          "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 [a&]:hover:bg-red-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
