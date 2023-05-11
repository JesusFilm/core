import { SvgIconProps } from '@mui/material/SvgIcon'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement, lazy, Suspense } from 'react'

const Like = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/Like'
    )
)

const Share = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/Share'
    )
)
const Target = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/Target'
    )
)

const ThumbsDown = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/ThumbsDown'
    )
)

export const IconNames = [
  'none',
  'Like',
  'Share',
  'Target',
  'ThumbsDown'
] as const

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
          none: <div />,
          Like: <Like {...iconProps} />,
          Share: <Share {...iconProps} />,
          Target: <Target {...iconProps} />,
          ThumbsDown: <ThumbsDown {...iconProps} />
        }[name]
      }
    </Suspense>
  )
}
