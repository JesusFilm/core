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
const Edit = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'custom-icon' */
      './outlined/Edit'
    )
)

export const IconNames = ['none', 'Edit', 'Like', 'Target'] as const

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
          Edit:
            variant === 'outlined' ? (
              <Edit {...iconProps} />
            ) : (
              `${name}IconSolid`
            ),
          Like:
            variant === 'outlined' ? (
              <Like {...iconProps} />
            ) : (
              `${name}IconSolid`
            ),
          Target:
            variant === 'outlined' ? (
              <Target {...iconProps} />
            ) : (
              `${name}IconSolid`
            )
        }[name]
      }
    </Suspense>
  )
}
