import { z } from 'zod'

import { BlockSchema } from '../blocks/blocks.zod'

const LanguageSchema = z.object({
  id: z.string()
})

const ThemeModeSchema = z.enum(['dark', 'light'])

const ThemeNameSchema = z.enum(['base'])

const JourneyStatusSchema = z.enum([
  'archived',
  'deleted',
  'draft',
  'published',
  'trashed'
])

const JourneyMenuButtonIconSchema = z.enum([
  'menu1',
  'equals',
  'home3',
  'home4',
  'more',
  'ellipsis',
  'grid1',
  'chevronDown'
])

const JourneySchema = z
  .object({
    id: z.string().describe('ID of the journey, which is a UUID'),
    title: z.string().describe('Title of the journey'),
    language: LanguageSchema.describe(
      'Language in which the journey is available'
    ),
    themeMode: ThemeModeSchema.describe(
      "Theme mode of the journey, can be 'dark' or 'light'"
    ),
    themeName: ThemeNameSchema.describe('Name of the theme'),
    description: z.string().nullable().describe('Description of the journey'),
    slug: z
      .string()
      .describe('A unique identifier for the journey, used in URLs'),
    archivedAt: z
      .date()
      .nullable()
      .describe('Date when the journey was archived'),
    deletedAt: z
      .date()
      .nullable()
      .describe('Date when the journey was deleted'),
    publishedAt: z
      .date()
      .nullable()
      .describe('Date when the journey was published'),
    trashedAt: z
      .date()
      .nullable()
      .describe('Date when the journey was trashed'),
    featuredAt: z
      .date()
      .nullable()
      .describe('Date when the journey was featured'),
    updatedAt: z.date().describe('Date when the journey was last updated'),
    createdAt: z.date().describe('Date when the journey was created'),
    status: JourneyStatusSchema.describe('Current status of the journey'),
    seoTitle: z.string().nullable().describe('SEO title for the journey'),
    seoDescription: z
      .string()
      .nullable()
      .describe('SEO description for the journey'),
    template: z
      .boolean()
      .nullable()
      .describe('Indicates if the journey is a template'),
    strategySlug: z
      .string()
      .nullable()
      .describe('Strategy slug associated with the journey'),
    plausibleToken: z.string().nullable().describe('Token for plausible stats'),
    website: z
      .boolean()
      .nullable()
      .describe('Indicates if a website is associated with the journey'),
    showShareButton: z
      .boolean()
      .nullable()
      .describe('Whether to display the share button'),
    showLikeButton: z
      .boolean()
      .nullable()
      .describe('Whether to display the like button'),
    showDislikeButton: z
      .boolean()
      .nullable()
      .describe('Whether to display the dislike button'),
    displayTitle: z.string().nullable().describe('Display title for viewers'),
    showHosts: z.boolean().nullable().describe('Whether to display hosts'),
    showChatButtons: z
      .boolean()
      .nullable()
      .describe('Whether to display chat buttons'),
    showReactionButtons: z
      .boolean()
      .nullable()
      .describe('Whether to display reaction buttons'),
    showLogo: z.boolean().nullable().describe('Whether to display the logo'),
    showMenu: z.boolean().nullable().describe('Whether to display the menu'),
    showDisplayTitle: z
      .boolean()
      .nullable()
      .describe('Whether to display the public title'),
    menuButtonIcon: JourneyMenuButtonIconSchema.nullable().describe(
      'Icon used for the menu button'
    ),
    blocks: z.array(BlockSchema).describe('Blocks within the journey')
  })
  .describe('Schema for defining a Journey')

export { JourneySchema }
