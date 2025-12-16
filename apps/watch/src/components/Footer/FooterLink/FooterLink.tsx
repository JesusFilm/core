import Image from 'next/image'
import Link from 'next/link'
import { HTMLAttributeAnchorTarget, ReactElement } from 'react'

import { cn } from '../../../libs/cn/cn'

interface FooterLinkProps {
  url: string
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
  url,
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
  const isExternal = /^https?:\/\//.test(url)
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
        className="h-auto w-auto"
      />
    )

  if (isExternal) {
    return (
      <a
        href={url}
        target={target}
        rel={rel}
        data-testid="FooterLink"
        className={cn(
          'inline-flex cursor-pointer items-center gap-2 text-neutral-900 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
          className
        )}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      href={url}
      rel={rel}
      data-testid="FooterLink"
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 text-neutral-900 transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900',
        className
      )}
    >
      {content}
    </Link>
  )
}
