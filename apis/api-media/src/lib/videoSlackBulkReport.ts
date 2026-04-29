import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

const englishLanguageIdForNames = '529'

export interface BulkVideoReportRow {
  production: string
  mediaComponentId: string
  isNew: boolean
  createdDate: Date
  changeDate: Date
  languageNames: string[]
  languageIds: string[]
}

interface BulkVideoRow {
  id: string
  slug: string | null
  primaryLanguageId: string
  createdAt: Date
  updatedAt: Date
  title: Array<{ value: string }>
  variants: Array<{
    languageId: string
    createdAt: Date
    updatedAt: Date
  }>
}

function productionLabel(video: {
  title: Array<{ value: string }>
  slug: string | null
  id: string
}): string {
  const title = video.title[0]?.value
  if (title != null && title !== '') {
    return title
  }
  if (video.slug != null && video.slug !== '') {
    return video.slug
  }
  return video.id
}

async function loadLanguageNames(ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids)].filter((id) => id.length > 0)
  const map = new Map<string, string>()
  if (unique.length === 0) {
    return map
  }

  try {
    const rows = await languagesPrisma.language.findMany({
      where: { id: { in: unique } },
      select: {
        id: true,
        name: {
          where: {
            languageId: englishLanguageIdForNames,
            primary: true
          },
          select: { value: true }
        }
      }
    })

    for (const row of rows) {
      map.set(row.id, row.name[0]?.value ?? row.id)
    }
  } catch (error) {
    logger.warn(
      { error },
      'Bulk video Slack: could not load language names; using raw language IDs'
    )
  }

  for (const id of unique) {
    if (!map.has(id)) {
      map.set(id, id)
    }
  }

  return map
}

function latestDate(dates: Date[]): Date {
  return new Date(Math.max(...dates.map((date) => date.getTime())))
}

function sortRows(rows: BulkVideoReportRow[]): BulkVideoReportRow[] {
  return [...rows].sort((a, b) => {
    if (a.isNew !== b.isNew) {
      return a.isNew ? -1 : 1
    }
    return b.changeDate.getTime() - a.changeDate.getTime()
  })
}

export async function loadBulkVideoReport(args: {
  startDate: Date
  endDate: Date
}): Promise<BulkVideoReportRow[]> {
  const { startDate, endDate } = args

  const videos: BulkVideoRow[] = await prisma.video.findMany({
    where: {
      label: { not: 'collection' },
      OR: [
        {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        {
          variants: {
            some: {
              OR: [
                {
                  createdAt: {
                    gte: startDate,
                    lte: endDate
                  }
                },
                {
                  updatedAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              ]
            }
          }
        }
      ]
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      slug: true,
      primaryLanguageId: true,
      createdAt: true,
      updatedAt: true,
      title: {
        where: { primary: true },
        take: 1,
        select: { value: true }
      },
      variants: {
        where: {
          OR: [
            {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            {
              updatedAt: {
                gte: startDate,
                lte: endDate
              }
            }
          ]
        },
        orderBy: [{ languageId: 'asc' }],
        select: {
          languageId: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  })

  const languageIds = videos.flatMap((video) =>
    video.variants.length > 0
      ? video.variants.map((variant) => variant.languageId)
      : [video.primaryLanguageId]
  )
  const languageNames = await loadLanguageNames(languageIds)

  return sortRows(
    videos.map((video) => {
      const isNew =
        video.createdAt.getTime() >= startDate.getTime() &&
        video.createdAt.getTime() <= endDate.getTime()
      const variantLanguageIds =
        video.variants.length > 0
          ? [...new Set(video.variants.map((variant) => variant.languageId))]
          : [video.primaryLanguageId]
      const activityDates = [
        video.updatedAt,
        video.createdAt,
        ...video.variants.flatMap((variant) => [
          variant.createdAt,
          variant.updatedAt
        ])
      ].filter(
        (date) =>
          date.getTime() >= startDate.getTime() &&
          date.getTime() <= endDate.getTime()
      )

      return {
        production: productionLabel(video),
        mediaComponentId: video.id,
        isNew,
        createdDate: video.createdAt,
        changeDate:
          activityDates.length > 0
            ? latestDate(activityDates)
            : video.updatedAt,
        languageIds: variantLanguageIds,
        languageNames: variantLanguageIds.map(
          (id) => languageNames.get(id) ?? id
        )
      }
    })
  )
}
