import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import BeenhereRounded from '@mui/icons-material/BeenhereRounded'
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import FormatQuoteRounded from '@mui/icons-material/FormatQuoteRounded'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import { ReactElement, createElement } from 'react'

import { IconName } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../../libs/block'
import { BlockFields_IconBlock as IconBlock } from '../../libs/block/__generated__/BlockFields'
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
