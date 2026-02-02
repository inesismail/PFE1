"use client"

import * as React from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const iconVariants = {
    danger: (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
      </div>
    ),
    warning: (
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
        <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>
    ),
    default: null,
  };

  const buttonVariants = {
    danger: 'destructive' as const,
    warning: 'default' as const,
    default: 'default' as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          {iconVariants[variant]}
          <DialogTitle className={cn("mt-4", variant !== 'default' && "text-center")}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className={cn(variant !== 'default' && "text-center")}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={() => {
              onConfirm();
            }}
            className="w-full sm:w-auto"
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
