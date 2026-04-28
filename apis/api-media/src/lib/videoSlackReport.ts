
import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

const oneWeekInDays = 7
const englishLanguageIdForNames = '529'
const packageParentLabels = new Set(['series', 'featureFilm'])
const packageChildLabels = new Set(['episode', 'segment'])

export interface ReportRow {
  production: string
  mediaComponentId: string
  languageName: string
  changeType: 'New Upload' | 'Update'
  updateSource: 'New Video' | 'Variant Updated' | 'Video Metadata'
  changeDate: Date
  total: number
}

export interface WeeklyVideoSummaryOptions {
  startDate?: Date
  endDate?: Date
}

interface WeeklyVideoSummaryWindow {
  startDate: Date
  endDate: Date
}

interface ReportRowSeed extends ReportRow {
  videoLabel: string
  languageId: string
}

interface CreatedVideoRow {
  id: string
  label: string
  slug: string | null
  primaryLanguageId: string
  createdAt: Date
  title: Array<{ value: string }>
}

interface UpdatedVariantRow {
  videoId: string
  languageId: string
  updatedAt: Date
  video: {
    id: string
    label: string
    slug: string | null
    title: Array<{ value: string }>
  } | null
}

interface VideoMetadataOnlyRow extends CreatedVideoRow {
  updatedAt: Date
}

export function formatDateIso(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function resolveWeeklyVideoSummaryWindow(args: {
  currentDate?: Date
  options?: WeeklyVideoSummaryOptions
}): WeeklyVideoSummaryWindow {
  const { currentDate = new Date(), options = {} } = args
  const endDate =
    options.endDate != null ? new Date(options.endDate) : new Date(currentDate)
  const startDate =
    options.startDate != null ? new Date(options.startDate) : new Date(endDate)

  if (options.startDate == null) {
    startDate.setUTCDate(startDate.getUTCDate() - oneWeekInDays)
  }

  return { startDate, endDate }
}

export function isValidWeeklyVideoSummaryWindow(
  window: WeeklyVideoSummaryWindow
): boolean {
  return window.startDate.getTime() <= window.endDate.getTime()
}

const createdVideoSelect = {
  id: true,
  label: true,
  slug: true,
  primaryLanguageId: true,
  createdAt: true,
  title: {
    where: { primary: true },
    take: 1,
    select: { value: true }
  }
} as const

const updatedVariantSelect = {
  videoId: true,
  languageId: true,
  updatedAt: true,
  video: {
    select: {
      id: true,
      label: true,
      slug: true,
      title: {
        where: { primary: true },
        take: 1,
        select: { value: true }
      }
    }
  }
} as const

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

function sortReportRows<T extends ReportRow>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.changeType !== b.changeType) {
      return a.changeType === 'New Upload' ? -1 : 1
    }
    return b.changeDate.getTime() - a.changeDate.getTime()
  })
}

async function getCreatedVideosForReport(
  startDate: Date,
  endDate: Date
): Promise<CreatedVideoRow[]> {
  return await prisma.video.findMany({
    where: {
      label: { not: 'collection' },
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: createdVideoSelect
  })
}

async function getUpdatedVariantsForReport(
  startDate: Date,
  endDate: Date
): Promise<UpdatedVariantRow[]> {
  return await prisma.videoVariant.findMany({
    where: {
      updatedAt: {
        gte: startDate,
        lte: endDate
      },
      video: {
        label: { not: 'collection' },
        createdAt: {
          lt: startDate
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: updatedVariantSelect
  })
}

async function getVideosMetadataOnlyUpdates(
  startDate: Date,
  endDate: Date,
  videoIdsWithVariantUpdates: Set<string>
): Promise<VideoMetadataOnlyRow[]> {
  const where: {
    label: { not: 'collection' }
    createdAt: { lt: Date }
    updatedAt: { gte: Date; lte: Date }
    id?: { notIn: string[] }
  } = {
    label: { not: 'collection' },
    createdAt: {
      lt: startDate
    },
    updatedAt: {
      gte: startDate,
      lte: endDate
    }
  }

  if (videoIdsWithVariantUpdates.size > 0) {
    where.id = { notIn: [...videoIdsWithVariantUpdates] }
  }

  return await prisma.video.findMany({
    where,
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      ...createdVideoSelect,
      updatedAt: true
    }
  })
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
      const label = row.name[0]?.value ?? row.id
      map.set(row.id, label)
    }
  } catch (error) {
    logger.warn(
      { error },
      'Weekly video Slack: could not load language names; using raw language IDs'
    )
  }

  for (const id of unique) {
    if (!map.has(id)) {
      map.set(id, id)
    }
  }

  return map
}

async function getLanguagePackageTotals(
  rowSeeds: ReportRowSeed[]
): Promise<Map<string, number>> {
  const eligibleRows = rowSeeds.filter((row) =>
    packageParentLabels.has(row.videoLabel)
  )
  if (eligibleRows.length === 0) {
    return new Map()
  }

  const parentIds = [
    ...new Set(eligibleRows.map((row) => row.mediaComponentId))
  ]
  const languageIds = [...new Set(eligibleRows.map((row) => row.languageId))]

  const parentVideos = await prisma.video.findMany({
    where: {
      id: { in: parentIds }
    },
    select: {
      id: true,
      children: {
        select: {
          id: true,
          label: true
        }
      }
    }
  })

  const packageVideoIds = new Set<string>()
  const packageMembersByParentId = new Map<string, string[]>()

  for (const parent of parentVideos) {
    const memberIds = [
      parent.id,
      ...parent.children
        .filter((child) => packageChildLabels.has(child.label))
        .map((child) => child.id)
    ]
    packageMembersByParentId.set(parent.id, memberIds)
    for (const id of memberIds) {
      packageVideoIds.add(id)
    }
  }

  const packageVariants = await prisma.videoVariant.findMany({
    where: {
      languageId: { in: languageIds },
      videoId: { in: [...packageVideoIds] }
    },
    select: {
      languageId: true,
      videoId: true
    }
  })

  const variantVideoIdsByLanguage = new Map<string, Set<string>>()
  for (const variant of packageVariants) {
    const videoIds =
      variantVideoIdsByLanguage.get(variant.languageId) ?? new Set<string>()
    videoIds.add(variant.videoId)
    variantVideoIdsByLanguage.set(variant.languageId, videoIds)
  }

  const totals = new Map<string, number>()
  for (const row of eligibleRows) {
    const packageMembers = packageMembersByParentId.get(
      row.mediaComponentId
    ) ?? [row.mediaComponentId]
    const languageVideoIds = variantVideoIdsByLanguage.get(row.languageId)
    const countForLanguage =
      languageVideoIds == null
        ? 1
        : packageMembers.filter((id) => languageVideoIds.has(id)).length

    totals.set(
      `${row.mediaComponentId}:${row.languageId}`,
      Math.max(1, countForLanguage)
    )
  }

  return totals
}

async function buildReportRows(args: {
  createdVideos: CreatedVideoRow[]
  updatedVariants: UpdatedVariantRow[]
  videosMetadataOnly: VideoMetadataOnlyRow[]
  languageNames: Map<string, string>
}): Promise<ReportRow[]> {
  const { createdVideos, updatedVariants, videosMetadataOnly, languageNames } =
    args

  const createdRows: ReportRowSeed[] = createdVideos.map((video) => ({
    production: productionLabel(video),
    mediaComponentId: video.id,
    languageName:
      languageNames.get(video.primaryLanguageId) ?? video.primaryLanguageId,
    changeType: 'New Upload',
    updateSource: 'New Video',
    changeDate: video.createdAt,
    total: 1,
    videoLabel: video.label,
    languageId: video.primaryLanguageId
  }))

  const variantUpdateRows: ReportRowSeed[] = updatedVariants
    .filter(
      (
        variant
      ): variant is UpdatedVariantRow & {
        video: NonNullable<UpdatedVariantRow['video']>
      } => variant.video != null
    )
    .map((variant) => ({
      production: productionLabel(variant.video),
      mediaComponentId: variant.video.id,
      languageName: languageNames.get(variant.languageId) ?? variant.languageId,
      changeType: 'Update' as const,
      updateSource: 'Variant Updated' as const,
      changeDate: variant.updatedAt,
      total: 1,
      videoLabel: variant.video.label,
      languageId: variant.languageId
    }))

  const metadataOnlyRows: ReportRowSeed[] = videosMetadataOnly.map((video) => ({
    production: productionLabel(video),
    mediaComponentId: video.id,
    languageName:
      languageNames.get(video.primaryLanguageId) ?? video.primaryLanguageId,
    changeType: 'Update',
    updateSource: 'Video Metadata',
    changeDate: video.updatedAt,
    total: 1,
    videoLabel: video.label,
    languageId: video.primaryLanguageId
  }))

  const rowSeeds = sortReportRows([
    ...createdRows,
    ...variantUpdateRows,
    ...metadataOnlyRows
  ])
  const packageTotals = await getLanguagePackageTotals(rowSeeds)

  return rowSeeds.map((row) => ({
    production: row.production,
    mediaComponentId: row.mediaComponentId,
    languageName: row.languageName,
    changeType: row.changeType,
    updateSource: row.updateSource,
    changeDate: row.changeDate,
    total: packageTotals.get(`${row.mediaComponentId}:${row.languageId}`) ?? 1
  }))
}

export async function loadWeeklyVideoReport(args: {
  startDate: Date
  endDate: Date
}): Promise<{
  rows: ReportRow[]
  counts: {
    newVideos: number
    variantUpdateRows: number
    videoMetadataOnlyRows: number
  }
}> {
  const { startDate, endDate } = args
  const [createdVideos, updatedVariants] = await Promise.all([
    getCreatedVideosForReport(startDate, endDate),
    getUpdatedVariantsForReport(startDate, endDate)
  ])

  const videoIdsWithVariantUpdates = new Set(
    updatedVariants
      .map((variant) => variant.videoId)
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
  )
  const videosMetadataOnly = await getVideosMetadataOnlyUpdates(
    startDate,
    endDate,
    videoIdsWithVariantUpdates
  )
  const languageNames = await loadLanguageNames([
    ...createdVideos.map((video) => video.primaryLanguageId),
    ...updatedVariants.map((variant) => variant.languageId),
    ...videosMetadataOnly.map((video) => video.primaryLanguageId)
  ])
  const rows = await buildReportRows({
    createdVideos,
    updatedVariants,
    videosMetadataOnly,
    languageNames
  })

  return {
    rows,
    counts: {
      newVideos: createdVideos.length,
      variantUpdateRows: updatedVariants.length,
      videoMetadataOnlyRows: videosMetadataOnly.length
    }
  }
}
