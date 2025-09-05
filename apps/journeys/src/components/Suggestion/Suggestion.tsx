'use client'

import { Button } from '../Button'
import { ScrollArea, ScrollBar } from '../ScrollArea'
import { cn } from '../../lib/utils'
import type { ComponentProps } from 'react'

export type SuggestionsProps = ComponentProps<typeof ScrollArea>

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => (
  <ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
    <div className={cn('flex w-max flex-nowrap items-center gap-2', className)}>
      {children}
    </div>
    <ScrollBar className="hidden" orientation="horizontal" />
  </ScrollArea>
)

export type SuggestionProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  suggestion: string
  onClick?: (suggestion: string) => void
}

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = 'outline',
  size = 'sm',
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion)
  }

  return (
    <Button
      className={cn(
        'cursor-pointer rounded-full px-4',
        'bg-suggestion-bg text-suggestion-text border-suggestion-border',
        'hover:bg-suggestion-hover-bg hover:text-suggestion-hover-text',
        'dark:bg-dark-suggestion-bg dark:text-dark-suggestion-text dark:border-dark-suggestion-border',
        'dark:hover:bg-dark-suggestion-hover-bg dark:hover:text-dark-suggestion-hover-text',
        className
      )}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  )
}
