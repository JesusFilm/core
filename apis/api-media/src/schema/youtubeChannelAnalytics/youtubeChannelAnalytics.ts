import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'

import {
  YOUTUBE_ANALYTICS_RETENTION_DAYS,
  youtubeAnalyticsCutoff
} from './retention'

/** A year of days, plus one for a leap year. */
const MAX_DAYS = 366
/** Allowed clock skew between Wheat and Core when checking fetchedAt. */
const FETCHED_AT_SKEW_MS = 5 * 60_000
const ONE_DAY_MS = 86_400_000
const CHANNEL_ID = /^UC[\w-]{22}$/

const FIGURES = [
  'views',
  'estimatedMinutesWatched',
  'averageViewDuration',
  'subscribersGained',
  'subscribersLost'
] as const

type Figure = (typeof FIGURES)[number]

function badInput(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } })
}

function channelIdOf(value: string | number): string {
  const channelId = String(value)
  if (!CHANNEL_ID.test(channelId)) {
    throw badInput('channelId must be a YouTube channel ID (UC…)')
  }
  return channelId
}

export const YoutubeChannelAnalyticsDay = builder.prismaObject(
  'YoutubeChannelAnalyticsDay',
  {
    description:
      "One YouTube channel's YouTube Analytics figures for one day, as Wheat fetched them under the operator's grant. A null figure means YouTube withheld it, not zero. Rows fetched more than 28 days ago are never returned and are deleted nightly, two days inside YouTube API Services policy's 30-day limit. Copies kept elsewhere must be refreshed or deleted within 30 days of fetchedAt.",
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      channelId: t.exposeID('channelId', { nullable: false }),
      day: t.expose('day', { type: 'Date', nullable: false }),
      views: t.exposeInt('views'),
      estimatedMinutesWatched: t.exposeInt('estimatedMinutesWatched'),
      averageViewDuration: t.exposeInt('averageViewDuration', {
        description: 'Seconds.'
      }),
      subscribersGained: t.exposeInt('subscribersGained'),
      subscribersLost: t.exposeInt('subscribersLost'),
      fetchedAt: t.expose('fetchedAt', {
        type: 'DateTime',
        nullable: false,
        description:
          'When Wheat fetched the figures from YouTube. The 28-day clock runs from here.'
      })
    })
  }
)

const YoutubeChannelAnalyticsDayInput = builder.inputType(
  'YoutubeChannelAnalyticsDayInput',
  {
    description:
      'One day of figures. Omit or null a figure YouTube withheld; never send zero for it.',
    fields: (t) => ({
      day: t.field({ type: 'Date', required: true }),
      views: t.int({ required: false }),
      estimatedMinutesWatched: t.int({ required: false }),
      averageViewDuration: t.int({
        required: false,
        description: 'Seconds.'
      }),
      subscribersGained: t.int({ required: false }),
      subscribersLost: t.int({ required: false })
    })
  }
)

const YoutubeChannelAnalyticsDaysUpsertInput = builder.inputType(
  'YoutubeChannelAnalyticsDaysUpsertInput',
  {
    fields: (t) => ({
      channelId: t.id({ required: true }),
      fetchedAt: t.field({
        type: 'DateTime',
        required: true,
        description:
          "When Wheat fetched these figures from YouTube, not when it sends them: figures served from Wheat's read cache keep the time they were first fetched."
      }),
      days: t.field({
        type: [YoutubeChannelAnalyticsDayInput],
        required: true
      })
    })
  }
)

type DayInput = typeof YoutubeChannelAnalyticsDayInput.$inferInput

function figuresOf(day: DayInput): Record<Figure, number | null> {
  const figures = {} as Record<Figure, number | null>
  for (const name of FIGURES) {
    const value = day[name] ?? null
    if (value != null && value < 0) {
      throw badInput(`${name} must not be negative`)
    }
    figures[name] = value
  }
  return figures
}

builder.queryFields((t) => ({
  youtubeChannelAnalyticsDays: t
    .withAuth({ isYoutubeAnalyticsReader: true })
    .prismaField({
      type: ['YoutubeChannelAnalyticsDay'],
      nullable: false,
      description:
        "A channel's stored YouTube Analytics figures, one row per day in the range, oldest first. Days Wheat has not sent, or sent more than 28 days ago, are absent.",
      args: {
        channelId: t.arg.id({ required: true }),
        startDate: t.arg({ type: 'Date', required: true }),
        endDate: t.arg({ type: 'Date', required: true })
      },
      resolve: async (query, _root, { channelId, startDate, endDate }) => {
        const channel = channelIdOf(channelId)
        if (startDate > endDate) {
          throw badInput('startDate must not be after endDate')
        }
        if (endDate.getTime() - startDate.getTime() >= MAX_DAYS * ONE_DAY_MS) {
          throw badInput(`the range must not exceed ${MAX_DAYS} days`)
        }
        return await prisma.youtubeChannelAnalyticsDay.findMany({
          ...query,
          where: {
            channelId: channel,
            day: { gte: startDate, lte: endDate },
            fetchedAt: { gt: youtubeAnalyticsCutoff(new Date()) }
          },
          orderBy: { day: 'asc' }
        })
      }
    })
}))

builder.mutationFields((t) => ({
  youtubeChannelAnalyticsDaysUpsert: t
    .withAuth({ isYoutubeAdmin: true })
    .field({
      type: 'Int',
      nullable: false,
      description:
        "Store a channel's daily YouTube Analytics figures, replacing any stored figures for the same days and restarting their 28-day clock. Returns how many days were written.",
      args: {
        input: t.arg({
          type: YoutubeChannelAnalyticsDaysUpsertInput,
          required: true
        })
      },
      resolve: async (_root, { input }) => {
        const channelId = channelIdOf(input.channelId)

        const now = new Date()
        if (input.fetchedAt.getTime() > now.getTime() + FETCHED_AT_SKEW_MS) {
          throw badInput('fetchedAt must not be in the future')
        }
        if (input.fetchedAt <= youtubeAnalyticsCutoff(now)) {
          throw badInput(
            `fetchedAt is more than ${YOUTUBE_ANALYTICS_RETENTION_DAYS} days ago; fetch the figures again`
          )
        }

        if (input.days.length < 1 || input.days.length > MAX_DAYS) {
          throw badInput(`days must hold between 1 and ${MAX_DAYS} entries`)
        }
        const seen = new Set<number>()
        for (const day of input.days) {
          if (seen.has(day.day.getTime())) {
            throw badInput('days must not repeat a day')
          }
          seen.add(day.day.getTime())
        }

        // Within the skew allowance, a fetchedAt ahead of Core's clock is
        // stored as now, so the clock never starts later than Core can see.
        const fetchedAt =
          input.fetchedAt.getTime() > now.getTime() ? now : input.fetchedAt
        const writes = input.days.map((day) => {
          const figures = { ...figuresOf(day), fetchedAt }
          return prisma.youtubeChannelAnalyticsDay.upsert({
            where: { channelId_day: { channelId, day: day.day } },
            create: { channelId, day: day.day, ...figures },
            update: figures
          })
        })
        await prisma.$transaction(writes)
        return writes.length
      }
    }),
  youtubeChannelAnalyticsDelete: t.withAuth({ isYoutubeAdmin: true }).field({
    type: 'Int',
    nullable: false,
    description:
      'Delete every stored YouTube Analytics figure for a channel, as when it is disconnected or its grant is revoked. Returns how many days were deleted; zero when none were stored.',
    args: {
      channelId: t.arg.id({ required: true })
    },
    resolve: async (_root, { channelId }) => {
      const { count } = await prisma.youtubeChannelAnalyticsDay.deleteMany({
        where: { channelId: channelIdOf(channelId) }
      })
      return count
    }
  })
}))
