import Image from 'next/image'
import { HTMLAttributeAnchorTarget, ReactElement } from 'react'

import { cn } from '../../../libs/cn'

interface FooterLinkProps {
  url: string
  label: string
  className?: string
  src?: string
  width?: number
  height?: number
  target?: HTMLAttributeAnchorTarget
  noFollow?: boolean
}

export function FooterLink({
  url,
  label,
  className,
  src,
  width,
  height,
  target,
  noFollow = false
}: FooterLinkProps): ReactElement {
  const relValue = noFollow ? 'nofollow noopener' : 'noopener'

  if (src != null) {
    return (
      <a
        href={url}
        target={target}
        rel={relValue}
        className={cn(
          'inline-flex cursor-pointer items-center outline-none transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300',
          className
        )}
        data-testid="FooterLink"
      >
        <Image
          src={src}
          width={width ?? 32}
          height={height ?? 32}
          alt={label}
          className="h-auto w-auto max-w-full"
        />
      </a>
    )
  }

  return (
    <a
      href={url}
      target={target}
      rel={relValue}
      data-testid="FooterLink"
      className={cn(
        'cursor-pointer text-sm font-semibold text-gray-900 transition-colors hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300',
        className
      )}
    >
      {label}
    </a>
  )
}
