import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const IconNameSchema = z.enum([
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
])

const IconColorSchema = z.enum([
  'primary',
  'secondary',
  'action',
  'error',
  'disabled',
  'inherit'
])

const IconSizeSchema = z.enum(['sm', 'md', 'lg', 'xl', 'inherit'])

// IconBlock schema
const IconBlockSchema = BlockSchema.extend({
  name: IconNameSchema.nullable(),
  color: IconColorSchema.nullable(),
  size: IconSizeSchema.nullable()
})

export { IconBlockSchema, IconNameSchema, IconColorSchema, IconSizeSchema }
