import { builder } from '../../../builder'

// Define the icon name values as a const array for reuse
const ICON_NAME_VALUES = [
  'PlayArrowRounded',
  'TranslateRounded',
  'CheckCircleRounded',
  'RadioButtonUncheckedRounded',
  'FormatQuoteRounded',
  'LockOpenRounded',
  'ArrowForwardRounded',
  'ArrowBackRounded',
  'ChatBubbleOutlineRounded',
  'LiveTvRounded',
  'MenuBookRounded',
  'ChevronRightRounded',
  'ChevronLeftRounded',
  'BeenhereRounded',
  'SendRounded',
  'SubscriptionsRounded',
  'ContactSupportRounded',
  'Launch',
  'MailOutline'
] as const

// Export the type for reuse
export type IconNameType = (typeof ICON_NAME_VALUES)[number] | null

// Create enum type for IconName
export const IconName = builder.enumType('IconName', {
  values: ICON_NAME_VALUES
})
