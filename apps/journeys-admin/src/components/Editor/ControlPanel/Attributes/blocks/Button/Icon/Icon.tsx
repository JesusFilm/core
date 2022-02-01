import { ReactElement } from 'react'
import {
  IconColor,
  IconSize,
  IconName
} from '../../../../../../../../__generated__/globalTypes'

interface IconProps {
  id: string
  iconName: IconName | null
  iconColor: IconColor | null
  iconSize: IconSize | null
}

export function Icon({
  id,
  iconName,
  iconColor,
  iconSize
}: IconProps): ReactElement {
  return <></>
}
