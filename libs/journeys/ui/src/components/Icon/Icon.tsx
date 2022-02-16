import { createElement, ReactElement } from 'react'
import {
  CheckCircleRounded,
  PlayArrowRounded,
  TranslateRounded,
  RadioButtonUncheckedRounded,
  FormatQuoteRounded,
  LockOpenRounded,
  ArrowForwardRounded,
  ChatBubbleOutlineRounded,
  LiveTvRounded,
  MenuBookRounded,
  ChevronRightRounded,
  BeenhereRounded,
  SendRounded,
  SubscriptionsRounded,
  ContactSupportRounded
} from '@mui/icons-material'
import { BlockFields_IconBlock as IconBlock } from '../../libs/transformer/__generated__/BlockFields'
import { TreeBlock } from '../..'

export function Icon({
  iconName,
  iconColor,
  iconSize
}: TreeBlock<IconBlock>): ReactElement | null {
  const fontSize =
    iconSize === 'sm'
      ? '16px'
      : iconSize === 'md'
      ? '20px'
      : iconSize === 'lg'
      ? '28px'
      : iconSize === 'xl'
      ? '48px'
      : 'inherit'

  const icons = {
    CheckCircleRounded,
    PlayArrowRounded,
    TranslateRounded,
    RadioButtonUncheckedRounded,
    FormatQuoteRounded,
    LockOpenRounded,
    ArrowForwardRounded,
    ChatBubbleOutlineRounded,
    LiveTvRounded,
    MenuBookRounded,
    ChevronRightRounded,
    BeenhereRounded,
    SendRounded,
    SubscriptionsRounded,
    ContactSupportRounded
  }

  return createElement(icons[iconName], {
    color: iconColor ?? undefined,
    sx: { fontSize }
  })
}
