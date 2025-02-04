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
  name: IconNameSchema.nullable().describe(
    'Icon name from MUI icons, available icons found in IconNameSchema enum.'
  ),
  color: IconColorSchema.nullable().describe('Color of the icon'),
  size: IconSizeSchema.nullable().describe('Size of the icon')
})

export { IconBlockSchema, IconNameSchema, IconColorSchema, IconSizeSchema }
