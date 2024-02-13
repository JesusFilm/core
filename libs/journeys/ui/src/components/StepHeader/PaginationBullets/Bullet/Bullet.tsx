import CircleIcon from '@mui/icons-material/Circle'
import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

type BulletVariant = 'lg' | 'md' | 'sm'

interface BulletProps {
  variant?: BulletVariant
  sx?: SxProps
}

export function Bullet({ variant, sx }: BulletProps): ReactElement {
  return (
    <CircleIcon
      sx={{
        ...sx,
        fontSize: '10px',
        scale: variant === 'sm' ? '.33' : variant === 'md' ? '.66' : '1',
        opacity: variant === 'lg' ? '100%' : '60%'
      }}
    />
  )
}
