import { ReactElement } from 'react'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Image from 'next/image'

type ValueOf<T> = T[keyof T]

interface FooterLinkProps {
  url: string
  label: string
  variant?: ValueOf<{ MuiLink; variant }>
  underline?: ValueOf<{ MuiLink; underline }>
  src?: string
  width?: string
  height?: string
}

export function FooterLink({
  url,
  label,
  variant = 'body1',
  underline = 'none',
  src,
  width,
  height
}: FooterLinkProps): ReactElement {
  return (
    <MuiLink
      href={url}
      underline={underline}
      target="_blank"
      rel="noopener"
      color="text.primary"
    >
      {src == null ? (
        <Typography variant={variant}>{label}</Typography>
      ) : (
        <Image
          src={src}
          width={width ?? 32}
          height={height ?? 32}
          alt={label}
        />
      )}
    </MuiLink>
  )
}
