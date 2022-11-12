import { createElement, ReactElement } from 'react'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import BeenhereRounded from '@mui/icons-material/BeenhereRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { IconName } from '../../../__generated__/globalTypes'
import { BlockFields_IconBlock as IconBlock } from '../../libs/block/__generated__/BlockFields'
import type { TreeBlock } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'
import { getJourneyRTL } from '../../libs/rtl'

export function Icon({
  iconName,
  iconColor,
  iconSize
}: TreeBlock<IconBlock>): ReactElement | null {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

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
    ArrowBackRounded,
    ChatBubbleOutlineRounded,
    LiveTvRounded,
    MenuBookRounded,
    ChevronRightRounded,
    ChevronLeftRounded,
    BeenhereRounded,
    SendRounded,
    SubscriptionsRounded,
    ContactSupportRounded
  }

  const iconRTL =
    rtl &&
    (iconName === IconName.ChatBubbleOutlineRounded ||
      iconName === IconName.SendRounded)

  return iconName === null ? (
    <div data-testid="None" />
  ) : (
    createElement(icons[iconName], {
      color: iconColor ?? undefined,
      sx: { fontSize, transform: iconRTL ? 'scaleX(-1)' : undefined }
    })
  )
}
