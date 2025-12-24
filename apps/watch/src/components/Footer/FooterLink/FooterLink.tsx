import Image from 'next/image'
import { HTMLAttributeAnchorTarget, ReactElement } from 'react'

import { cn } from '@core/shared/ui-modern/utils'

interface FooterLinkProps {
  href: string
  label: string
  className?: string
  labelClassName?: string
  src?: string
  width?: number
  height?: number
  target?: HTMLAttributeAnchorTarget
  noFollow?: boolean
}

export function FooterLink({
  href,
  label,
  className,
  labelClassName,
  src,
  width,
  height,
  target,
  noFollow = false
}: FooterLinkProps): ReactElement {
  const rel = noFollow ? 'nofollow noopener' : 'noopener'
  const content =
    src == null ? (
      <span
        className={cn(
          'text-sm leading-6 font-semibold text-neutral-900',
          labelClassName
        )}
      >
        {label}
      </span>
    ) : (
      <Image
        src={src}
        width={width ?? 32}
        height={height ?? 32}
        alt={label}
        className={cn('h-auto w-auto', labelClassName)}
      />
    )

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      data-testid="FooterLink"
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 text-neutral-900 transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
        className
      )}
    >
      {content}
    </a>
  )
}
