import Box from '@mui/material/Box'
import SvgIcon from '@mui/material/SvgIcon'
import { ReactElement } from 'react'

import { BlockFields as Block } from '@core/journeys/ui/block/__generated__/BlockFields'
import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import GitBranchIcon from '@core/shared/ui/icons/GitBranch'
import Play3Icon from '@core/shared/ui/icons/Play3'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

interface StepBlockNodeIconProps {
  typename: Block['__typename']
}

export function StepBlockNodeIcon({
  typename
}: StepBlockNodeIconProps): ReactElement {
  let background: string | undefined
  let Icon: typeof SvgIcon
  switch (typename) {
    case 'VideoBlock':
      background = 'linear-gradient(to bottom, #f89f4c, #de7818)'
      Icon = Play3Icon
      break
    case 'TextResponseBlock':
      background = 'linear-gradient(to bottom, #b849ec, #9415d1)'
      Icon = TextInput1Icon
      break
    case 'ButtonBlock':
    case 'RadioQuestionBlock':
      background = 'linear-gradient(to bottom, #4c9bf8, #1873de)'
      Icon = GitBranchIcon
      break
    case 'TypographyBlock':
      background = 'linear-gradient(to bottom, #00C3C3, #03a3a3)'
      Icon = AlignCenterIcon
      break
    default:
      Icon = FlexAlignBottom1Icon
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
        color: 'background.paper',
        background
      }}
    >
      <Icon fontSize="small" />
    </Box>
  )
}
