import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'

interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
  icon?: React.ReactNode
}

export function Accordion({ title, children, defaultOpen = false, className = '', icon }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border border-border rounded-lg ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}
