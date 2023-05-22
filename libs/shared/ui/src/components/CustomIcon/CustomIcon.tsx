import { SvgIconProps } from '@mui/material/SvgIcon'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement, Suspense } from 'react'
import { iconComponents, iconNames } from './icons'

type IconName = (typeof iconNames)[number]

interface CustomIconProps
  extends Pick<SvgIconProps, 'color' | 'fontSize' | 'sx'> {
  name: IconName
}

export function CustomIcon({
  name,
  ...iconProps
}: CustomIconProps): ReactElement {
  const IconComponent = iconComponents[name]
  return (
    <Suspense fallback={<CircularProgress size="16px" />}>
      {IconComponent != null ? <IconComponent {...iconProps} /> : <div />}
    </Suspense>
  )
}
