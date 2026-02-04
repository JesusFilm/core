import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import LiveTvRounded from '@mui/icons-material/LiveTvRounded'
import LockOpenRounded from '@mui/icons-material/LockOpenRounded'
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded'
import { ReactElement, createElement } from 'react'

import ArrowLeftContained2 from '@core/shared/ui/icons/ArrowLeftContained2'
import ArrowRightContained2 from '@core/shared/ui/icons/ArrowRightContained2'
import Bible from '@core/shared/ui/icons/Bible'
import CheckContained from '@core/shared/ui/icons/CheckContained'
import Globe1 from '@core/shared/ui/icons/Globe1'
import HelpCircleContained from '@core/shared/ui/icons/HelpCircleContained'
import Home4 from '@core/shared/ui/icons/Home4'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import LinkExternal from '@core/shared/ui/icons/LinkExternal'
import Mail1 from '@core/shared/ui/icons/Mail1'
import Marker2 from '@core/shared/ui/icons/Marker2'
import MessageChat1 from '@core/shared/ui/icons/MessageChat1'
import MessageSquare from '@core/shared/ui/icons/MessageSquare'
import MessageText2 from '@core/shared/ui/icons/MessageText2'
import Note2 from '@core/shared/ui/icons/Note2'
import Phone from '@core/shared/ui/icons/Phone'
import Play1 from '@core/shared/ui/icons/Play1'
import Play3 from '@core/shared/ui/icons/Play3'
import Send2 from '@core/shared/ui/icons/Send2'
import UserProfile2 from '@core/shared/ui/icons/UserProfile2'
import UsersProfiles3 from '@core/shared/ui/icons/UsersProfiles3'
import Volume5 from '@core/shared/ui/icons/Volume5'

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
    PlayArrowRounded: Play3,
    TranslateRounded: Globe1,
    CheckCircleRounded: CheckContained,
    FormatQuoteRounded: MessageText2,
    ArrowForwardRounded,
    ArrowBackRounded,
    ChatBubbleOutlineRounded: MessageSquare,
    MenuBookRounded: Bible,
    ChevronRightRounded,
    ChevronLeftRounded,
    BeenhereRounded: Marker2,
    SendRounded: Send2,
    SubscriptionsRounded: Play1,
    ContactSupportRounded: HelpCircleContained,
    Launch: LinkExternal,
    MailOutline: Mail1,
    ArrowLeftContained2,
    ArrowRightContained2,
    MessageChat1,
    Home4,
    LinkAngled,
    Volume5,
    Note2,
    UserProfile2,
    UsersProfiles3,
    Phone,

    // ===== DEPRECATED BUT KEPT FOR BACKWARD COMPATIBILITY =====
    // Keep these so existing journeys don't break
    RadioButtonUncheckedRounded,
    LockOpenRounded,
    LiveTvRounded
  }

  const iconRTL =
    rtl &&
    (iconName === IconName.MenuBookRounded ||
      iconName === IconName.ChatBubbleOutlineRounded ||
      iconName === IconName.FormatQuoteRounded ||
      iconName === IconName.MessageChat1 ||
      iconName === IconName.Launch ||
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
