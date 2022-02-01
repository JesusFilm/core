import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import {
  IconColor,
  IconSize,
  IconName
} from '../../../../../../../../__generated__/globalTypes'
import { ColorToggleGroup } from './ColorToggleGroup'
import { SizeToggleGroup } from './SizeToggleGroup'

interface IconProps {
  id: string
  iconName: IconName | undefined
  iconColor: IconColor | null | undefined
  iconSize: IconSize | null | undefined
}

export function Icon({
  id,
  iconName,
  iconColor,
  iconSize
}: IconProps): ReactElement {
  return (
    <>
      <Typography>Icon Name</Typography>
      <Typography>Icon Name description</Typography>
      {/* switch */}
      {/* drop down list of all the icons */}

      <Box>
        {/* Show box on switch */}
        <ColorToggleGroup id={id} color={iconColor} />
        <SizeToggleGroup id={id} size={iconSize} />
      </Box>
    </>
  )
}
