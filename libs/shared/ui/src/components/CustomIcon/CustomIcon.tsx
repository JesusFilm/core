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

const ThumbsDown = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/ThumbsDown'
    )
)

export const IconNames = ['none', 'Like', 'Target', 'ThumbsDown'] as const

type IconName = (typeof IconNames)[number]

interface CustomIconProps
  extends Pick<SvgIconProps, 'color' | 'fontSize' | 'sx'> {
  name: IconName
}

export function CustomIcon({
  name,
  ...iconProps
}: CustomIconProps): ReactElement {
  return (
    <Suspense fallback={<CircularProgress size="16px" />}>
      {
        {
          none: null,
          Like: <Like {...iconProps} />,
          Target: <Target {...iconProps} />,
          ThumbsDown: <ThumbsDown {...iconProps} />
        }[name]
      }
    </Suspense>
  )
}
