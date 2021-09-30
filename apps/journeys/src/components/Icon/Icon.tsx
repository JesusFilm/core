import { ReactElement } from 'react'
import {
  CheckCircle,
  PlayArrow,
  Translate,
  RadioButtonUnchecked,
  FormatQuote,
  LockOpen,
  ArrowForward,
  ChatBubbleOutline,
  LiveTv,
  MenuBook
} from '@mui/icons-material'
import { ButtonFields_startIcon as IconType } from '../../../__generated__/ButtonFields'

export interface IconProps extends IconType {
  ariaHidden?: boolean
}

export function Icon({ name, color, size }: IconProps): ReactElement | null {
  const fontSize =
    size === 'sm'
      ? '16px'
      : size === 'md'
      ? '20px'
      : size === 'lg'
      ? '28px'
      : size === 'xl'
      ? '48px'
      : 'inherit'

  switch (name) {
    case 'CheckCircle':
      return <CheckCircle color={color ?? undefined} sx={{ fontSize }} />
    case 'PlayArrow':
      return <PlayArrow color={color ?? undefined} sx={{ fontSize }} />
    case 'Translate':
      return <Translate color={color ?? undefined} sx={{ fontSize }} />
    case 'RadioButtonUnchecked':
      return (
        <RadioButtonUnchecked color={color ?? undefined} sx={{ fontSize }} />
      )
    case 'FormatQuote':
      return <FormatQuote color={color ?? undefined} sx={{ fontSize }} />
    case 'LockOpen':
      return <LockOpen color={color ?? undefined} sx={{ fontSize }} />
    case 'ArrowForward':
      return <ArrowForward color={color ?? undefined} sx={{ fontSize }} />
    case 'ChatBubbleOutline':
      return <ChatBubbleOutline color={color ?? undefined} sx={{ fontSize }} />
    case 'LiveTv':
      return <LiveTv color={color ?? undefined} sx={{ fontSize }} />
    case 'MenuBook':
      return <MenuBook color={color ?? undefined} sx={{ fontSize }} />
    default:
      return null
  }
}
