"use client"

import type React from "react"

import { useState } from "react"
import { Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ExpandableComponentProps {
  title: string
  description?: string
  children: React.ReactNode
  expandedContent?: React.ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  expandedClassName?: string
  expandedHeaderClassName?: string
  expandedContentClassName?: string
}

export function ExpandableComponent({
  title,
  description,
  children,
  expandedContent,
  className = "bg-[#0f172a] border-slate-800",
  headerClassName = "pb-2",
  contentClassName = "p-4 md:p-6 pt-2",
  expandedClassName = "max-w-full sm:max-w-[100vw] md:max-w-[90vw] lg:max-w-[80vw] max-h-[90vh] p-0 overflow-hidden bg-[#0f172a] border-slate-700 text-white",
  expandedHeaderClassName = "sticky top-0 z-50 bg-[#0f172a] p-4 border-b border-slate-700 shadow",
  expandedContentClassName = "p-4 sm:p-6 overflow-y-auto",
}: ExpandableComponentProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Card className={className}>
        <CardHeader className={headerClassName}>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
              {description && <CardDescription className="text-sm text-slate-400">{description}</CardDescription>}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              onClick={() => setIsOpen(true)}
              aria-label="Expand"
              title="Expand"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={expandedClassName}>
          <DialogHeader className={expandedHeaderClassName}>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
          </DialogHeader>

          <div className="flex flex-col h-full">
            <div className={expandedContentClassName} style={{ maxHeight: "calc(90vh - 120px)" }}>
              {expandedContent || children}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
