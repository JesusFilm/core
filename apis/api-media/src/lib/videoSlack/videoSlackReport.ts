import { prisma as languagesPrisma } from '@core/prisma/languages/client'
import { prisma } from '@core/prisma/media/client'

import { logger } from '../../logger'

const oneWeekInDays = 7
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
}

interface NewVariantRow {
  videoId: string
  languageId: string
  createdAt: Date
  version: number
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

export function resolveWeeklyVideoSummaryWindow(args: {
  currentDate?: Date
  options?: WeeklyVideoSummaryOptions
}): WeeklyVideoSummaryWindow {
  const { currentDate = new Date(), options = {} } = args
  const endDate =
    options.endDate != null ? new Date(options.endDate) : new Date(currentDate)
  if (options.endDate == null) {
    endDate.setUTCHours(23, 59, 59, 999)
  }

  const startDate =
    options.startDate != null ? new Date(options.startDate) : new Date(endDate)

  if (options.startDate == null) {
    startDate.setUTCDate(startDate.getUTCDate() - oneWeekInDays)
    startDate.setUTCHours(0, 0, 0, 0)
  }

  return { startDate, endDate }
}

export function isValidWeeklyVideoSummaryWindow(
  window: WeeklyVideoSummaryWindow
): boolean {
  return window.startDate.getTime() <= window.endDate.getTime()
}

const newVariantSelect = {
  videoId: true,
  languageId: true,
  createdAt: true,
  version: true,
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

async function getNewVariantsForReport(
  startDate: Date,
  endDate: Date
): Promise<NewVariantRow[]> {
  return await prisma.videoVariant.findMany({
    where: {
      published: true,
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      video: {
        label: { not: 'collection' },
        published: true
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: newVariantSelect
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

interface PackageRoot {
  id: string
  label: string
  slug: string | null
  createdAt: Date
  title: Array<{ value: string }>
  packageSize: number
}

async function loadPackageRoots(args: {
  newVariants: ValidNewVariant[]
}): Promise<{
  packageRootById: Map<string, PackageRoot>
  childToPackageRoot: Map<string, PackageRoot>
}> {
  const { newVariants } = args
  const packageRootById = new Map<string, PackageRoot>()
  const childToPackageRoot = new Map<string, PackageRoot>()

  const childCandidateIds = new Set<string>()
  const directParentIds = new Set<string>()
  for (const variant of newVariants) {
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

interface ValidNewVariant {
  videoId: string
  languageId: string
  createdAt: Date
  version: number
  video: NonNullable<NewVariantRow['video']>
}

interface VariantGroup {
  packageRoot: PackageRoot | null
  fallbackVideo: ValidNewVariant['video']
  languageId: string
  variants: ValidNewVariant[]
  latestChangeDate: Date
}

async function buildReportRows(args: {
  newVariants: NewVariantRow[]
  windowStart: Date
  windowEnd: Date
  languageNames: Map<string, string>
}): Promise<ReportRow[]> {
  const { newVariants, windowStart, windowEnd, languageNames } = args

  const validVariants: ValidNewVariant[] = newVariants.filter(
    (variant): variant is ValidNewVariant => variant.video != null
  )

  const { packageRootById, childToPackageRoot } = await loadPackageRoots({
    newVariants: validVariants
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

    const rootId = packageRoot?.id ?? variant.video.id
    const key = `${rootId}:${variant.languageId}`
    const existing = groupsByKey.get(key)
    if (existing != null) {
      existing.variants.push(variant)
      if (variant.createdAt > existing.latestChangeDate) {
        existing.latestChangeDate = variant.createdAt
      }
      continue
    }
    groupsByKey.set(key, {
      packageRoot,
      fallbackVideo: variant.video,
      languageId: variant.languageId,
      variants: [variant],
      latestChangeDate: variant.createdAt
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
    packageSize: row.packageSize
  }))
}

export async function loadWeeklyVideoReport(args: {
  startDate: Date
  endDate: Date
}): Promise<{
  rows: ReportRow[]
  counts: {
    newVariants: number
  }
}> {
  const { startDate, endDate } = args
  const newVariants = await getNewVariantsForReport(startDate, endDate)
  const languageNames = await loadLanguageNames(
    newVariants.map((variant) => variant.languageId)
  )
  const rows = await buildReportRows({
    newVariants,
    windowStart: startDate,
    windowEnd: endDate,
    languageNames
  })

  return {
    rows,
    counts: {
      newVariants: newVariants.length
    }
  }
}
