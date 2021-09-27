import { ReactElement } from 'react'
import { CheckCircle, PlayArrow, Translate, RadioButtonUnchecked, FormatQuote, LockOpen, ArrowForward, ChatBubbleOutline, LiveTv, MenuBook } from '@mui/icons-material'
import { ButtonBlockFields_startIcon as IconType } from '../Button/__generated__/ButtonBlockFields'

export interface IconProps extends IconType {
  ariaHidden?: boolean
}

export function Icon({ name, color, size }: IconProps): ReactElement | null {
  switch (name) {
    case 'CheckCircle':
      return <CheckCircle color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'PlayArrow':
      return <PlayArrow color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'Translate':
      return <Translate color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'RadioButtonUnchecked':
      return <RadioButtonUnchecked color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'FormatQuote':
      return <FormatQuote color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'LockOpen':
      return <LockOpen color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'ArrowForward':
      return <ArrowForward color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'ChatBubbleOutline':
      return <ChatBubbleOutline color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'LiveTv':
      return <LiveTv color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    case 'MenuBook':
      return <MenuBook color={color ?? undefined} sx={{ fontSize: 'inherit' }} />
    default:
      return null
  }
}
