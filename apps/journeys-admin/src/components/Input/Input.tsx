import * as React from 'react'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type InputProps = React.ComponentProps<'input'> & {
  startIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', startIcon, fullWidth, ...props }, ref) => {
    const widthClass = fullWidth === true ? 'w-full' : undefined
    const tokens = (className ?? '').split(/\s+/).filter(Boolean)
    const isMarginToken = (t: string) => {
      const last = t.split(':').pop() as string
      return /^-?m[trblxy]?-(?:\[[^\]]+\]|(?:px|auto|\d+(?:\.\d+)?))$/.test(
        last
      )
    }
    const wrapperTokens: string[] = []
    const inputTokens: string[] = []
    for (const t of tokens) {
      if (isMarginToken(t)) wrapperTokens.push(t)
      else inputTokens.push(t)
    }
    const wrapperClassName = wrapperTokens.join(' ') || undefined
    const inputExtraClassName = inputTokens.join(' ') || undefined

    if (startIcon == null) {
      return (
        <input
          data-slot="input"
          type={type}
          className={cn(
            'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
            widthClass,
            inputExtraClassName
          )}
          ref={ref}
          {...props}
        />
      )
    }

    return (
      <div className={cn('relative', widthClass, wrapperClassName)}>
        <span
          data-slot="input-start-icon"
          className="text-muted-foreground pointer-events-none absolute inset-y-0 left-2 flex items-center [&>svg:not([class*='size-'])]:size-4"
        >
          {startIcon}
        </span>
        <input
          data-slot="input"
          type={type}
          className={cn(
            'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 rounded-md border bg-transparent px-3 py-2 pl-9 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
            widthClass,
            inputExtraClassName
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
