'use client'

import { Field as FieldPrimitive } from '@base-ui/react/field'
import { mergeProps } from '@base-ui/react/merge-props'
import type * as React from 'react'

import { cn } from '@/lib/utils'

export type TextareaProps = React.ComponentPropsWithoutRef<'textarea'> &
  React.RefAttributes<HTMLTextAreaElement> & {
    size?: 'sm' | 'default' | 'lg' | number
    unstyled?: boolean
  }

export function Textarea({
  className,
  size = 'default',
  unstyled = false,
  ref,
  ...props
}: TextareaProps): React.ReactElement {
  return (
    <span
      className={
        cn(
          !unstyled &&
            'border-input bg-background ring-ring/24 has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring dark:bg-input/32 dark:has-aria-invalid:ring-destructive/24 relative inline-grid w-full rounded-lg border text-base shadow-xs/5 transition-shadow not-dark:bg-clip-padding before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:has-not-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/4%)] has-focus-visible:ring-[3px] has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none sm:text-sm dark:not-has-disabled:has-not-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]',
          className
        ) || undefined
      }
      data-size={size}
      data-slot="textarea-control"
    >
      <FieldPrimitive.Control
        ref={ref}
        value={props.value}
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        id={props.id}
        name={props.name}
        render={(defaultProps: React.ComponentProps<'textarea'>) => (
          <textarea
            className={cn(
              'text-foreground placeholder:text-muted-foreground/72 field-sizing-content min-h-17.5 w-full rounded-[inherit] px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] outline-none max-sm:min-h-20.5',
              size === 'sm' &&
                'min-h-16.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)] max-sm:min-h-19.5',
              size === 'lg' &&
                'min-h-18.5 py-[calc(--spacing(2)-1px)] max-sm:min-h-21.5'
            )}
            data-slot="textarea"
            {...mergeProps(defaultProps, props)}
          />
        )}
      />
    </span>
  )
}

export { FieldPrimitive }
