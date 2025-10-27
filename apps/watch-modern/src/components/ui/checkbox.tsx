import React from 'react'

import { cn } from "@core/shared/uimodern/utils"

type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onChange, onCheckedChange, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:text-primary-foreground',
        className
      )}
      onChange={(event) => {
        onChange?.(event)
        onCheckedChange?.(event.currentTarget.checked)
      }}
      {...props}
    />
  )
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
