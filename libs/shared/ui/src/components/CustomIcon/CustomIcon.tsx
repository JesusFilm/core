import { SvgIconProps } from '@mui/material/SvgIcon'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement, lazy, Suspense } from 'react'

const Target = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/Target'
    )
)
const Like = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/Like'
    )
)

export const IconNames = ['none', 'Like', 'Target'] as const

type IconName = (typeof IconNames)[number]

interface CustomIconProps
  extends Pick<SvgIconProps, 'color' | 'fontSize' | 'sx'> {
  name: IconName
  variant?: 'outlined' | 'solid'
}

export function CustomIcon({
  name,
  variant = 'outlined',
  ...iconProps
}: CustomIconProps): ReactElement {
  return (
    <Suspense fallback={<CircularProgress size="16px" />}>
      {
        {
          none: null,
          Like:
            variant === 'outlined' ? <Like {...iconProps} /> : `${name}Solid`,
          Target:
            variant === 'outlined' ? <Target {...iconProps} /> : `${name}Solid`
        }[name]
      }
    </Suspense>
  )
}
