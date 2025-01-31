import Box from '@mui/material/Box'
import SvgIcon from '@mui/material/SvgIcon'
import { ReactElement } from 'react'

import { BlockFields as Block } from '@core/journeys/ui/block/__generated__/BlockFields'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import Cursor6 from '@core/shared/ui/icons/Cursor6'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import GitBranchIcon from '@core/shared/ui/icons/GitBranch'
import Image3 from '@core/shared/ui/icons/Image3'
import Mail1 from '@core/shared/ui/icons/Mail1'
import Play3Icon from '@core/shared/ui/icons/Play3'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

interface StepBlockNodeIconProps {
  typename: Block['__typename']
  showMultiIcon?: boolean
}

export function StepBlockNodeIcon({
  typename,
  showMultiIcon = false
}: StepBlockNodeIconProps): ReactElement {
  let background: string | undefined
  let Icon: typeof SvgIcon
  let color = 'background.paper'

  if (!showMultiIcon) {
    switch (typename) {
      case 'RadioQuestionBlock':
        background = 'linear-gradient(to bottom, #4c9bf8, #1873de)'
        Icon = GitBranchIcon
        break
      case 'VideoBlock':
        background = 'linear-gradient(to bottom, #f89f4c, #de7818)'
        Icon = Play3Icon
        break
      case 'TextResponseBlock':
        background = 'linear-gradient(to bottom, #b849ec, #9415d1)'
        Icon = TextInput1Icon
        break
      case 'ButtonBlock':
        background = 'linear-gradient(to bottom, #d8b500, #a28800)'
        Icon = Cursor6
        break
      case 'TypographyBlock':
        background = 'linear-gradient(to bottom, #00C3C3, #03a3a3)'
        Icon = AlignCenterIcon
        break
      case 'ImageBlock':
        background = 'linear-gradient(to bottom, #e01e92, #a8176d)'
        Icon = Image3
        break
      case 'SignUpBlock':
        background = 'linear-gradient(to bottom, #18af27, #10751a)'
        Icon = Mail1
        break
      default:
        background = '#FFFFFF'
        color = 'text.primary'
        Icon = FlexAlignBottom1Icon
    }
  } else {
    background = 'linear-gradient(to bottom, #4c9bf8, #1873de)'
    Icon = GitBranchIcon
  }

  return (
    <Box
      sx={{
        borderRadius: 20,
        height: 30,
        width: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        background
      }}
    >
      <Icon fontSize="small" />
    </Box>
  )
}
