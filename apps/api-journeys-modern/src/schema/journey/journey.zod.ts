import { z } from 'zod'

const ImageBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable(),
  src: z.string().url(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  blurhash: z.string(),
  scale: z.number().nullable(),
  focalTop: z.number(),
  focalLeft: z.number(),
  __typename: z.literal('ImageBlock')
})

const TypographyBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string(),
  parentOrder: z.number(),
  align: z.string().nullable(),
  color: z.string().nullable(),
  content: z.string(),
  variant: z.string(),
  __typename: z.literal('TypographyBlock')
})

const CardBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string(),
  parentOrder: z.number(),
  backgroundColor: z.string().nullable(),
  coverBlockId: z.string(),
  themeMode: z.string().nullable(),
  themeName: z.string().nullable(),
  fullscreen: z.boolean(),
  __typename: z.literal('CardBlock')
})

const StepBlockSchema = z.object({
  id: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number(),
  locked: z.boolean(),
  nextBlockId: z.string().nullable(),
  slug: z.string().nullable(),
  __typename: z.literal('StepBlock')
})

const BlockSchema = z.union([
  ImageBlockSchema,
  TypographyBlockSchema,
  CardBlockSchema,
  StepBlockSchema
])

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

const TeamSchema = z.object({
  id: z.string(),
  title: z.string(),
  publicTitle: z.string(),
  __typename: z.literal('Team')
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
