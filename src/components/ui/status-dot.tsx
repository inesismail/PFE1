import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusDotVariants = cva(
  "inline-flex shrink-0 rounded-full",
  {
    variants: {
      status: {
        online: "bg-emerald-500",
        offline: "bg-slate-400",
        warning: "bg-amber-500",
        error: "bg-red-500",
        pending: "bg-blue-500",
      },
      size: {
        sm: "h-2 w-2",
        md: "h-3 w-3",
        lg: "h-4 w-4",
      },
      pulse: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      status: "offline",
      size: "md",
      pulse: false,
    },
  }
)

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  label?: string
  showLabel?: boolean
}

const statusLabels: Record<string, string> = {
  online: "En ligne",
  offline: "Hors ligne",
  warning: "Attention",
  error: "Erreur",
  pending: "En attente",
}

function StatusDot({
  className,
  status = "offline",
  size,
  pulse,
  label,
  showLabel = false,
  ...props
}: StatusDotProps) {
  const displayLabel = label || (status ? statusLabels[status] : "")

  if (showLabel) {
    return (
      <span className="inline-flex items-center gap-2">
        <span
          className={cn(statusDotVariants({ status, size, pulse }), className)}
          {...props}
        />
        <span className="text-sm text-muted-foreground">{displayLabel}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(statusDotVariants({ status, size, pulse }), className)}
      title={displayLabel}
      {...props}
    />
  )
}

export { StatusDot, statusDotVariants }
