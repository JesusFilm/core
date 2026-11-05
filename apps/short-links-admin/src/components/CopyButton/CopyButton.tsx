'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { MouseEvent, ReactElement, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
}

export function CopyButton({
  value,
  label = 'Copy',
  className
}: CopyButtonProps): ReactElement {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timeout)
  }, [copied])

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={`${label} ${value}`}
      title={copied ? 'Copied' : label}
      onClick={handleClick}
      className={className}
    >
      {copied ? (
        <CheckIcon aria-hidden="true" className="text-success-foreground" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
    </Button>
  )
}
