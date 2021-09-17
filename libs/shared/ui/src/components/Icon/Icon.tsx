import { ReactElement } from 'react'
import { CheckCircle, PlayArrow, Translate, RadioButtonUnchecked, FormatQuote, LockOpen, ArrowForward, ChatBubbleOutline, LiveTv, MenuBook } from '@mui/icons-material'
import { ButtonBlockFields_startIcon as IconType } from '../Button/__generated__/ButtonBlockFields'

export interface IconProps extends IconType {
  ariaHidden?: boolean
}

export function Icon({ name, color, fontSize }: IconProps): ReactElement | null {
  switch (name) {
    case 'CheckCircle':
      return <CheckCircle color={color ?? undefined} sx={{ fontSize: fontSize }} />
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
