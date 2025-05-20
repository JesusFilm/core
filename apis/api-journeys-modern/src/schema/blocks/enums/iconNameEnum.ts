import { builder } from '../../builder'

// Create enum type for IconName
export const IconName = builder.enumType('IconName', {
  values: [
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
})
