import { createElement, ReactElement } from 'react'
import {
  CheckCircle as checkCircle,
  PlayArrow as playArrow,
  Translate as translate,
  RadioButtonUnchecked as radioButtonUnchecked,
  FormatQuote as formatQuote,
  LockOpen as lockOpen,
  ArrowForward as arrowForward,
  ChatBubbleOutline as chatBubbleOutline,
  LiveTv as liveTv,
  MenuBook as menuBook
} from '@mui/icons-material'
import { ButtonFields_startIcon as IconType } from '../../../__generated__/ButtonFields'

export function Icon({ name, color, size }: IconType): ReactElement | null {
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

  const icons = {
    checkCircle,
    playArrow,
    translate,
    radioButtonUnchecked,
    formatQuote,
    lockOpen,
    arrowForward,
    chatBubbleOutline,
    liveTv,
    menuBook
  }

  return createElement(icons[name], {
    color: color ?? undefined,
    sx: { fontSize }
  })
}
