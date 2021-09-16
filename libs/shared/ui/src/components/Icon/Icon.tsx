import { ReactElement } from 'react'
import { CheckCircle, PlayArrow, Translate, RadioButtonUnchecked, FormatQuote, LockOpen, ArrowForward, ChatBubbleOutline, LiveTv, MenuBook } from '@mui/icons-material'
import { IconColor, IconName, IconSize } from '../../../__generated__/globalTypes'

export interface IconProps {
  ariaHidden?: boolean
  name: string | undefined
  color?: IconColor
  size?: IconSize
}

export function Icon(props: IconProps): ReactElement | null {
  switch (props.name) {
    case 'CheckCircle':
      return <CheckCircle color={props.color ?? undefined} fontSize={props.size ?? undefined} />
    case 'PlayArrow':
      return <PlayArrow />
    case 'Translate':
      return <Translate />
    case 'RadioButtonUnchecked':
      return <RadioButtonUnchecked />
    case 'FormatQuote':
      return <FormatQuote />
    case 'LockOpen':
      return <LockOpen />
    case 'ArrowForward':
      return <ArrowForward />
    case 'ChatBubbleOutline':
      return <ChatBubbleOutline />
    case 'LiveTv':
      return <LiveTv />
    case 'MenuBook':
      return <MenuBook />
    default:
      return null
  }
}
