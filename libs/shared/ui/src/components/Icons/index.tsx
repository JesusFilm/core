import { SvgIconProps } from '@mui/material/SvgIcon'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement, lazy, Suspense } from 'react'

const Bar1Down = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'universal-icon' */
      './outlined/Bar1Down'
    )
)
const ChatText = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'universal-icon' */
      './outlined/ChatText'
    )
)
const FileAddOut = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'universal-icon' */
      './outlined/FileAddOut'
    )
)
const Globe = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'universal-icon' */
      './outlined/Globe'
    )
)
const GlobeSolid = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'universal-icon' */
      './solid/Globe'
    )
)
const InfoCircle = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'universal-icon' */
      './outlined/InfoCircle'
    )
)

export const IconNames = [
  'none',
  'Bar1Down',
  'ChatText',
  'FileAddOut',
  'Globe',
  'InfoCircle'
] as const

type IconName = (typeof IconNames)[number]

interface UniversalIconProps
  extends Pick<SvgIconProps, 'color' | 'fontSize' | 'sx'> {
  name: IconName
  variant?: 'outlined' | 'solid'
}

export default function UniversalIcon({
  name,
  variant = 'outlined',
  ...iconProps
}: UniversalIconProps): ReactElement {
  return (
    <Suspense fallback={<CircularProgress size="sm" />}>
      {
        {
          none: null,
          Bar1Down: variant === 'outlined' ? <Bar1Down {...iconProps} /> : null,
          ChatText: variant === 'outlined' ? <ChatText {...iconProps} /> : null,
          FileAddOut:
            variant === 'outlined' ? <FileAddOut {...iconProps} /> : null,
          Globe:
            variant === 'outlined' ? (
              <Globe {...iconProps} />
            ) : (
              <GlobeSolid {...iconProps} />
            ),
          InfoCircle:
            variant === 'outlined' ? <InfoCircle {...iconProps} /> : null,
          default: name
        }[name]
      }
    </Suspense>
  )
}
