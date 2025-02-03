import { z } from 'zod'

import { BlockSchema } from '../blocks/blocks.zod'
import { TeamSchema } from '../team/team.zod'

const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().url(),
  __typename: z.literal('User')
})

const UserJourneySchema = z.object({
  id: z.string(),
  role: z.string(),
  openedAt: z.string(),
  __typename: z.literal('UserJourney'),
  user: UserSchema
})

const LanguageSchema = z.object({
  id: z.string(),
  bcp47: z.string(),
  iso3: z.string(),
  name: z.array(
    z.object({
      value: z.string(),
      primary: z.boolean(),
      __typename: z.literal('LanguageName')
    })
  ),
  __typename: z.literal('Language')
})

const JourneySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  createdAt: z.string(),
  featuredAt: z.nullable(z.string()),
  publishedAt: z.string(),
  themeName: z.string(),
  themeMode: z.string(),
  strategySlug: z.nullable(z.string()),
  seoTitle: z.nullable(z.string()),
  seoDescription: z.nullable(z.string()),
  template: z.boolean(),
  blocks: z.array(BlockSchema),
  primaryImageBlock: z.nullable(z.string()),
  creatorDescription: z.nullable(z.string()),
  creatorImageBlock: z.nullable(z.string()),
  chatButtons: z.array(z.unknown()),
  host: z.nullable(z.string()),
  team: TeamSchema,
  tags: z.array(z.string()),
  website: z.boolean(),
  showShareButton: z.boolean(),
  showLikeButton: z.boolean(),
  showDislikeButton: z.boolean(),
  displayTitle: z.nullable(z.string()),
  logoImageBlock: z.nullable(z.string()),
  menuButtonIcon: z.nullable(z.string()),
  menuStepBlock: z.nullable(z.string()),
  __typename: z.literal('Journey'),
  language: LanguageSchema,
  userJourneys: z.array(UserJourneySchema)
})

export { JourneySchema }
