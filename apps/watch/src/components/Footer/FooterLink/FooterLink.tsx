import { cn } from '@core/shared/uimodern/utils'
import Image from 'next/image'
import Link from 'next/link'
import { HTMLAttributeAnchorTarget, ReactElement } from 'react'

interface FooterLinkProps {
  href: string
  label: string
  iconSrc?: string
  iconWidth?: number
  iconHeight?: number
  target?: HTMLAttributeAnchorTarget
  noFollow?: boolean
  className?: string
  textClassName?: string
  iconClassName?: string
}

export function FooterLink({
  href,
  label,
  iconSrc,
  iconWidth = 32,
  iconHeight = 32,
  target,
  noFollow = false,
  className,
  textClassName,
  iconClassName
}: FooterLinkProps): ReactElement {
  const rel = noFollow ? 'nofollow noopener' : 'noopener'

  const linkClasses = cn(
    'inline-flex cursor-pointer items-center gap-2 transition-colors duration-200 hover:text-neutral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
    className
  )

  const content =
    iconSrc != null ? (
      <Image
        alt={label}
        className={cn('h-auto w-auto', iconClassName)}
        height={iconHeight}
        src={iconSrc}
        width={iconWidth}
      />
    ) : (
      <span className={cn('text-sm font-semibold leading-6 text-neutral-900', textClassName)}>
        {label}
      </span>
    )

  const commonProps = {
    className: linkClasses,
    rel,
    target,
    'aria-label': iconSrc != null ? label : undefined,
    'data-testid': 'FooterLink'
  }

  if (href.startsWith('http')) {
    return (
      <a {...commonProps} href={href}>
        {content}
      </a>
    )
  }

  return (
    <Link {...commonProps} href={href}>
      {content}
    </Link>
  )
}
