import MuiLink, { LinkProps } from '@mui/material/Link'
import { SxProps, Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { HTMLAttributeAnchorTarget, ReactElement } from 'react'

type ValueOf<T> = T[keyof T]

interface FooterLinkProps {
  url: string
  label: string
  variant?: ValueOf<Pick<LinkProps, 'variant'>>
  underline?: ValueOf<Pick<LinkProps, 'underline'>>
  src?: string
  width?: number
  height?: number
  target?: HTMLAttributeAnchorTarget
  noFollow?: boolean
  sx?: SxProps<Theme>
}

export function FooterLink({
  url,
  label,
  variant = 'h6',
  underline = 'none',
  src,
  width,
  height,
  target,
  noFollow = false,
  sx
}: FooterLinkProps): ReactElement {
  return (
    <MuiLink
      href={url}
      underline={underline}
      target={target}
      rel={noFollow ? 'nofollow noopener' : 'noopener'}
      color="text.primary"
      data-testid="FooterLink"
      sx={src != null ? sx : undefined}
    >
      {src == null ? (
        <Typography variant={variant} sx={sx}>
          {label}
        </Typography>
      ) : (
        <Image
          src={src}
          width={width ?? 32}
          height={height ?? 32}
          alt={label}
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      )}
    </MuiLink>
  )
}
