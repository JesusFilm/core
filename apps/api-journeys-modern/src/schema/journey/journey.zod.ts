import { z } from 'zod'

import { BlockSchema } from '../blocks/blocks.zod'

const JourneyMenuButtonIcon = z.enum([
  'menu1',
  'equals',
  'home3',
  'home4',
  'more',
  'ellipsis',
  'grid1',
  'chevronDown'
])

const JourneyStatus = z.enum([
  'archived',
  'deleted',
  'draft',
  'published',
  'trashed'
])

const ThemeMode = z.enum(['dark', 'light'])
const ThemeName = z.enum(['base'])

const JourneySchema = z.object({
  id: z.string(),
  title: z.string(),
  language: z.object({ id: z.string() }),
  themeMode: ThemeMode,
  themeName: ThemeName,
  description: z.string().nullable(),
  slug: z.string(),
  archivedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  publishedAt: z.date().nullable(),
  trashedAt: z.date().nullable(),
  featuredAt: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),
  status: JourneyStatus,
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  template: z.boolean().nullable(),
  strategySlug: z.string().nullable(),
  plausibleToken: z.string().nullable(),
  website: z.boolean().nullable(),
  showShareButton: z.boolean().nullable(),
  showLikeButton: z.boolean().nullable(),
  showDislikeButton: z.boolean().nullable(),
  displayTitle: z.string().nullable(),
  showHosts: z.boolean().nullable(),
  showChatButtons: z.boolean().nullable(),
  showReactionButtons: z.boolean().nullable(),
  showLogo: z.boolean().nullable(),
  showMenu: z.boolean().nullable(),
  showDisplayTitle: z.boolean().nullable(),
  menuButtonIcon: JourneyMenuButtonIcon.nullable(),
  blocks: z.array(BlockSchema)
})

export { JourneySchema }
