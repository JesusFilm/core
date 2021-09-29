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
import { ButtonBlockFields_startIcon as IconType } from '../../../../__generated__/ButtonBlockFields'

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
      return (
        <CheckCircle color={color ?? undefined} sx={{ fontSize: fontSize }} />
      )
    case 'PlayArrow':
      return (
        <PlayArrow color={color ?? undefined} sx={{ fontSize: fontSize }} />
      )
    case 'Translate':
      return (
        <Translate color={color ?? undefined} sx={{ fontSize: fontSize }} />
      )
    case 'RadioButtonUnchecked':
      return (
        <RadioButtonUnchecked
          color={color ?? undefined}
          sx={{ fontSize: fontSize }}
        />
      )
    case 'FormatQuote':
      return (
        <FormatQuote color={color ?? undefined} sx={{ fontSize: fontSize }} />
      )
    case 'LockOpen':
      return <LockOpen color={color ?? undefined} sx={{ fontSize: fontSize }} />
    case 'ArrowForward':
      return (
        <ArrowForward color={color ?? undefined} sx={{ fontSize: fontSize }} />
      )
    case 'ChatBubbleOutline':
      return (
        <ChatBubbleOutline
          color={color ?? undefined}
          sx={{ fontSize: fontSize }}
        />
      )
    case 'LiveTv':
      return <LiveTv color={color ?? undefined} sx={{ fontSize: fontSize }} />
    case 'MenuBook':
      return <MenuBook color={color ?? undefined} sx={{ fontSize: fontSize }} />
    default:
      return null
  }
}
