import { SvgIconProps } from '@mui/material/SvgIcon'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement, lazy, Suspense } from 'react'

const Bar1Down = lazy(
  async () =>
    await import(
      /* webpackChunkName: 'universal-icon' */
      './Bar1Down'
    )
)

export const IconNames = ['', 'Bar1Down'] as const

// type IconName = (typeof IconNames)[number]

interface UniversalIconProps
  extends Pick<SvgIconProps, 'color' | 'fontSize' | 'sx'> {
  name: string
  variant?: 'outlined' | 'solid'
}

export default function UniversalIcon({
  name,
  ...iconProps
}: UniversalIconProps): ReactElement {
  return (
    <Suspense fallback={<CircularProgress size="sm" />}>
      {{ '': null, Bar1Down: <Bar1Down {...iconProps} />, default: null }[name]}
    </Suspense>
  )
}
