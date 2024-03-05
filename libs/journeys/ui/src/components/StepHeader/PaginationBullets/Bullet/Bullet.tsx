import CircleIcon from '@mui/icons-material/Circle'
import { ReactElement } from 'react'

type BulletVariant = 'active' | 'adjacent' | 'default'

interface BulletProps {
  variant: BulletVariant
  /**  left handles the spacing and animation of bullets */
  left: number
}

export function Bullet({ variant, left }: BulletProps): ReactElement {
  return (
    <CircleIcon
      data-testid={`bullet-${variant}`}
      sx={{
        color: { xs: 'primary.main', lg: 'white' },
        fontSize: '10px',
        scale:
          variant === 'active' ? '1' : variant === 'adjacent' ? '0.66' : '0.33',
        opacity: variant === 'active' ? '100%' : '60%',
        position: 'absolute',
        transition: 'scale 0.2s, left 0.2s',
        left: `${left}px`
      }}
    />
  )
}
