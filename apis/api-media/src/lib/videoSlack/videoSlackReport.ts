import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma } from '@core/prisma/media/client'

import { logger } from '../../logger'

import type { VideoSlackVideoFilter } from './videoSlackProfiles'

const oneDayMs = 24 * 60 * 60 * 1000
const englishLanguageIdForNames = '529'
const packageParentLabels = new Set(['series', 'featureFilm'])
const packageChildLabels = new Set(['episode', 'segment'])

export interface ReportRow {
  version: number
  production: string
  mediaComponentId: string
  languageId: string
  languageName: string
  changeType: 'New' | 'Update'
  changeDate: Date
  total: number
  packageSize: number
  watchUrl?: string
  nexusUrl?: string
}

export interface VideoSlackSummaryOptions {
  startDate?: Date
  endDate?: Date
  throwOnError?: boolean
}

interface VideoSlackSummaryWindow {
  startDate: Date
  endDate: Date
}

interface ReportRowSeed extends ReportRow {
  videoLabel: string
}

interface VariantRow {
  videoId: string
  languageId: string
  createdAt: Date
  updatedAt: Date
  version: number
  slug: string
  video: {
    id: string
    label: string
    slug: string | null
    createdAt: Date
    title: Array<{ value: string }>
  } | null
}

export function formatDateIso(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function resolveVideoSlackSummaryWindow(args: {
  currentDate?: Date
  options?: VideoSlackSummaryOptions
}): VideoSlackSummaryWindow {
  const { currentDate = new Date(), options = {} } = args
  const endDate =
    options.endDate != null
      ? new Date(options.endDate)
      : new Date(currentDate.getTime() - oneDayMs)
  const startDate =
    options.startDate != null
      ? new Date(options.startDate)
      : new Date(currentDate.getTime() - 2 * oneDayMs)

  return { startDate, endDate }
}

export function isValidVideoSlackSummaryWindow(
  window: VideoSlackSummaryWindow
): boolean {
  return window.startDate.getTime() <= window.endDate.getTime()
}

const variantSelect = {
  videoId: true,
  languageId: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  slug: true,
  video: {
    select: {
      id: true,
      label: true,
      slug: true,
      createdAt: true,
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
    const idCompare = a.mediaComponentId.localeCompare(b.mediaComponentId)
    if (idCompare !== 0) {
      return idCompare
    }
    return b.changeDate.getTime() - a.changeDate.getTime()
  })
}

type VideoIdentityWhere =
  | { id: { in: string[] } }
  | { originId: { in: string[] } }

function videoIdentityFilters(
  filter: VideoSlackVideoFilter
): VideoIdentityWhere[] {
  const filters: VideoIdentityWhere[] = []
  if (filter.ids != null && filter.ids.length > 0) {
    filters.push({ id: { in: filter.ids } })
  }
  if (filter.originIds != null && filter.originIds.length > 0) {
    filters.push({ originId: { in: filter.originIds } })
  }
  return filters
}

function videoFilterWhere(filter?: VideoSlackVideoFilter):
  | {
      OR: Array<
        VideoIdentityWhere | { parents: { some: { OR: VideoIdentityWhere[] } } }
      >
    }
  | Record<string, never> {
  if (filter == null) {
    return {}
  }

  const directVideoFilters = videoIdentityFilters(filter)
  if (directVideoFilters.length === 0) {
    return {}
  }

  return {
    OR: [
      ...directVideoFilters,
      {
        parents: {
          some: {
            OR: directVideoFilters
          }
        }
      }
    ]
  }
}

async function getVariantsForReport(args: {
  startDate: Date
  endDate: Date
  videoFilter?: VideoSlackVideoFilter
}): Promise<VariantRow[]> {
  const { startDate, endDate, videoFilter } = args

  return await prisma.videoVariant.findMany({
    where: {
      published: true,
      OR: [
        { createdAt: { gte: startDate, lte: endDate } },
        { updatedAt: { gte: startDate, lte: endDate } }
      ],
      video: {
        label: { not: 'collection' },
        published: true,
        ...videoFilterWhere(videoFilter)
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: variantSelect
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
            languageId: englishLanguageIdForNames
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
      'Video Slack: could not load language names; using raw language IDs'
    )
  }

  for (const id of unique) {
    if (!map.has(id)) {
      map.set(id, id)
    }
  }

  return map
}

interface PackageRoot {
  id: string
  label: string
  slug: string | null
  createdAt: Date
  title: Array<{ value: string }>
  packageSize: number
}

async function loadPackageRoots(args: { variants: ValidVariant[] }): Promise<{
  packageRootById: Map<string, PackageRoot>
  childToPackageRoot: Map<string, PackageRoot>
}> {
  const { variants } = args
  const packageRootById = new Map<string, PackageRoot>()
  const childToPackageRoot = new Map<string, PackageRoot>()

  const childCandidateIds = new Set<string>()
  const directParentIds = new Set<string>()
  for (const variant of variants) {
    if (packageChildLabels.has(variant.video.label)) {
      childCandidateIds.add(variant.video.id)
    }
    if (packageParentLabels.has(variant.video.label)) {
      directParentIds.add(variant.video.id)
    }
  }

  if (childCandidateIds.size === 0 && directParentIds.size === 0) {
    return { packageRootById, childToPackageRoot }
  }

  const packageRootSelect = {
    id: true,
    label: true,
    slug: true,
    createdAt: true,
    title: {
      where: { primary: true },
      take: 1,
      select: { value: true }
    },
    children: {
      select: {
        id: true,
        label: true
      }
    }
  } as const

  const orFilters: Array<Record<string, unknown>> = []
  if (childCandidateIds.size > 0) {
    orFilters.push({
      label: { in: [...packageParentLabels] },
      published: true,
      children: { some: { id: { in: [...childCandidateIds] } } }
    })
  }
  if (directParentIds.size > 0) {
    orFilters.push({ id: { in: [...directParentIds] } })
  }

  const parents = await prisma.video.findMany({
    where: { OR: orFilters },
    select: packageRootSelect
  })

  for (const parent of parents) {
    const qualifyingChildren = parent.children.filter((child) =>
      packageChildLabels.has(child.label)
    )
    const root: PackageRoot = {
      id: parent.id,
      label: parent.label,
      slug: parent.slug,
      createdAt: parent.createdAt,
      title: parent.title,
      packageSize: 1 + qualifyingChildren.length
    }
    packageRootById.set(parent.id, root)
    for (const child of qualifyingChildren) {
      childToPackageRoot.set(child.id, root)
    }
  }

  return { packageRootById, childToPackageRoot }
}

interface ValidVariant {
  videoId: string
  languageId: string
  createdAt: Date
  updatedAt: Date
  version: number
  slug: string
  video: NonNullable<VariantRow['video']>
}

interface VariantGroup {
  packageRoot: PackageRoot | null
  fallbackVideo: ValidVariant['video']
  languageId: string
  variants: ValidVariant[]
  latestChangeDate: Date
}

function latestVariantChangeDate(variant: ValidVariant): Date {
  return variant.updatedAt > variant.createdAt
    ? variant.updatedAt
    : variant.createdAt
}

function buildNexusUrl(mediaComponentId: string, languageId: string): string {
  return (
    'https://nexus.jesusfilm.org/media/videos/' +
    encodeURIComponent(mediaComponentId) +
    '?languageId=' +
    encodeURIComponent(languageId)
  )
}

function buildWatchUrl(variantSlug: string): string | undefined {
  const watchUrl = process.env.WATCH_URL
  if (watchUrl == null || watchUrl === '') {
    return undefined
  }

  const [videoSlug, languageSlug] = variantSlug.split('/')
  if (
    videoSlug == null ||
    videoSlug === '' ||
    languageSlug == null ||
    languageSlug === ''
  ) {
    return undefined
  }

  return (
    watchUrl.replace(/\/$/, '') +
    '/' +
    encodeURIComponent(videoSlug) +
    '.html/' +
    encodeURIComponent(languageSlug) +
    '.html'
  )
}

async function buildReportRows(args: {
  variants: VariantRow[]
  windowStart: Date
  windowEnd: Date
  languageNames: Map<string, string>
}): Promise<ReportRow[]> {
  const { variants, windowStart, windowEnd, languageNames } = args

  const validVariants: ValidVariant[] = variants.filter(
    (variant): variant is ValidVariant => variant.video != null
  )

  const { packageRootById, childToPackageRoot } = await loadPackageRoots({
    variants: validVariants
  })

  const groupsByKey = new Map<string, VariantGroup>()
  for (const variant of validVariants) {
    const label = variant.video.label
    let packageRoot: PackageRoot | null = null
    if (packageParentLabels.has(label)) {
      packageRoot = packageRootById.get(variant.video.id) ?? null
    } else if (packageChildLabels.has(label)) {
      packageRoot = childToPackageRoot.get(variant.video.id) ?? null
    }

    const changeDate = latestVariantChangeDate(variant)
    const rootId = packageRoot?.id ?? variant.video.id
    const key = rootId + ':' + variant.languageId
    const existing = groupsByKey.get(key)
    if (existing != null) {
      existing.variants.push(variant)
      if (changeDate > existing.latestChangeDate) {
        existing.latestChangeDate = changeDate
      }
      continue
    }
    groupsByKey.set(key, {
      packageRoot,
      fallbackVideo: variant.video,
      languageId: variant.languageId,
      variants: [variant],
      latestChangeDate: changeDate
    })
  }

  const rowSeeds: ReportRowSeed[] = Array.from(groupsByKey.values()).map(
    (group) => {
      const root = group.packageRoot
      const labelSource = root ?? group.fallbackVideo
      const rowVideo = root ?? group.fallbackVideo
      const packageSize = root?.packageSize ?? 1
      const total = Math.min(group.variants.length, packageSize)
      const rootCreatedAt = labelSource.createdAt.getTime()
      const isNewVideo =
        rootCreatedAt >= windowStart.getTime() &&
        rootCreatedAt <= windowEnd.getTime()
      const versionVariant =
        root != null
          ? (group.variants.find((variant) => variant.videoId === root.id) ??
            group.variants[0])
          : group.variants[0]
      const watchUrl = group.variants
        .map((variant) => buildWatchUrl(variant.slug))
        .find((url): url is string => url != null)
      return {
        version: versionVariant.version,
        production: productionLabel(rowVideo),
        mediaComponentId: rowVideo.id,
        languageId: group.languageId,
        languageName: languageNames.get(group.languageId) ?? group.languageId,
        changeType: isNewVideo ? ('New' as const) : ('Update' as const),
        changeDate: group.latestChangeDate,
        total,
        packageSize,
        watchUrl,
        nexusUrl: buildNexusUrl(rowVideo.id, group.languageId),
        videoLabel: labelSource.label
      }
    }
  )

  const filteredSeeds = rowSeeds.filter(
    (row) => !row.mediaComponentId.startsWith('0')
  )

  return sortReportRows(filteredSeeds).map((row) => ({
    version: row.version,
    production: row.production,
    mediaComponentId: row.mediaComponentId,
    languageId: row.languageId,
    languageName: row.languageName,
    changeType: row.changeType,
    changeDate: row.changeDate,
    total: row.total,
    packageSize: row.packageSize,
    watchUrl: row.watchUrl,
    nexusUrl: row.nexusUrl
  }))
}

export async function loadVideoSlackReport(args: {
  startDate: Date
  endDate: Date
  videoFilter?: VideoSlackVideoFilter
}): Promise<{
  rows: ReportRow[]
  counts: {
    variants: number
  }
}> {
  const { startDate, endDate, videoFilter } = args
  const variants = await getVariantsForReport({
    startDate,
    endDate,
    videoFilter
  })
  const languageNames = await loadLanguageNames(
    variants.map((variant) => variant.languageId)
  )
  const rows = await buildReportRows({
    variants,
    windowStart: startDate,
    windowEnd: endDate,
    languageNames
  })

  return {
    rows,
    counts: {
      variants: variants.length
    }
  }
}
