import { z } from 'zod'

import {
  JourneyMenuButtonIcon,
  JourneyUpdateInput,
  ThemeMode,
  ThemeName
} from '../../../../../__generated__/globalTypes'

const themeModeEnum = z.nativeEnum(ThemeMode).describe('Theme mode')
const themeNameEnum = z.nativeEnum(ThemeName).describe('Theme name')
const menuButtonIconEnum = z
  .nativeEnum(JourneyMenuButtonIcon)
  .describe('Menu button icon')

export const journeyUpdateInputSchema = z.object({
  title: z.string().optional().describe('Title of the journey'),
  description: z.string().optional().describe('Description of the journey'),
  languageId: z.string().optional().describe('Language ID of the journey'),
  themeMode: themeModeEnum.optional(),
  themeName: themeNameEnum.optional(),
  creatorDescription: z
    .string()
    .optional()
    .describe('Creator description of the journey'),
  creatorImageBlockId: z
    .string()
    .optional()
    .describe('Creator image block ID of the journey'),
  primaryImageBlockId: z
    .string()
    .optional()
    .describe('Primary image block ID of the journey'),
  slug: z.string().optional().describe('Slug of the journey'),
  seoTitle: z.string().optional().describe('SEO title of the journey'),
  seoDescription: z
    .string()
    .optional()
    .describe('SEO description of the journey'),
  hostId: z.string().optional().describe('Host ID of the journey'),
  strategySlug: z.string().optional().describe('Strategy slug of the journey'),
  tagIds: z.array(z.string()).optional().describe('Tag IDs of the journey'),
  website: z.boolean().optional().describe('Website of the journey'),
  showShareButton: z
    .boolean()
    .optional()
    .describe('Show share button of the journey'),
  showLikeButton: z
    .boolean()
    .optional()
    .describe('Show like button of the journey'),
  showDislikeButton: z
    .boolean()
    .optional()
    .describe('Show dislike button of the journey'),
  displayTitle: z.string().optional().describe('Display title of the journey'),
  showHosts: z.boolean().optional().describe('Show hosts of the journey'),
  showChatButtons: z
    .boolean()
    .optional()
    .describe('Show chat buttons of the journey'),
  showReactionButtons: z
    .boolean()
    .optional()
    .describe('Show reaction buttons of the journey'),
  showLogo: z.boolean().optional().describe('Show logo of the journey'),
  showMenu: z.boolean().optional().describe('Show menu of the journey'),
  showDisplayTitle: z
    .boolean()
    .optional()
    .describe('Show display title of the journey'),
  menuButtonIcon: menuButtonIconEnum
    .optional()
    .describe('Menu button icon of the journey'),
  menuStepBlockId: z
    .string()
    .optional()
    .describe('Menu step block ID of the journey'),
  logoImageBlockId: z
    .string()
    .optional()
    .describe('Logo image block ID of the journey')
}) satisfies z.ZodType<JourneyUpdateInput>
