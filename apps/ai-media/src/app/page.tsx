import { languageSlugs } from '@core/prisma/languages/__generated__/languageSlugs'

import { CoverageReportClient } from './CoverageReportClient'

const DEFAULT_LANGUAGE_ID = '529'
const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL
const WATCH_URL = process.env.NEXT_PUBLIC_WATCH_URL

function formatLanguageLabel(slug: string): string {
  return slug
    .replace(/\.html$/i, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const DEFAULT_LANGUAGE_OPTIONS = (() => {
  const options = Object.entries(languageSlugs)
    .map(([id, slug]) => ({
      id,
      englishLabel: formatLanguageLabel(slug),
      nativeLabel: ''
    }))
    .sort((a, b) => a.englishLabel.localeCompare(b.englishLabel))
    .slice(0, 50)

  if (!options.some((option) => option.id === DEFAULT_LANGUAGE_ID)) {
    options.unshift({
      id: DEFAULT_LANGUAGE_ID,
      englishLabel: formatLanguageLabel(
        languageSlugs[DEFAULT_LANGUAGE_ID] ?? 'english'
      ),
      nativeLabel: ''
    })
  }

  return options
})()

type Subtitle = {
  edition?: string | null
}

type CloudflareImage = {
  mobileCinematicHigh?: string | null
}

type VideoEdition = {
  name?: string | null
}

type VideoVariant = {
  slug?: string | null
  videoEdition?: VideoEdition | null
}

type VideoText = {
  value: string | null
}

type VideoStudyQuestion = {
  value: string | null
}

type VideoKeyword = {
  id: string
}

type BibleCitation = {
  id: string
}

type ChildVideo = {
  id: string
  publishedAt?: string | null
  title?: VideoText[]
  description?: VideoText[] | null
  studyQuestions?: VideoStudyQuestion[] | null
  bibleCitations?: BibleCitation[] | null
  keywords?: VideoKeyword[] | null
  images?: CloudflareImage[] | null
  subtitles?: Subtitle[] | null
  variant?: VideoVariant | null
}

type CollectionVideo = {
  id: string
  label?: string | null
  publishedAt?: string | null
  title?: VideoText[]
  description?: VideoText[] | null
  studyQuestions?: VideoStudyQuestion[] | null
  bibleCitations?: BibleCitation[] | null
  keywords?: VideoKeyword[] | null
  images?: CloudflareImage[] | null
  subtitles?: Subtitle[] | null
  variant?: VideoVariant | null
  children?: ChildVideo[] | null
  childrenCount?: number | null
}

type CollectionsResponse = {
  data?: {
    videos?: CollectionVideo[]
  }
  errors?: Array<{ message: string }>
}

const AI_EDITIONS = ['ai', 'auto', 'generated', 'machine', 'mux']
const VIDEO_LABEL_ORDER = [
  'collection',
  'featureFilm',
  'series',
  'episode',
  'trailer',
  'behindTheScenes'
] as const
const VIDEO_LABEL_DISPLAY: Record<(typeof VIDEO_LABEL_ORDER)[number], string> = {
  collection: 'Collection',
  featureFilm: 'Feature Film',
  series: 'Series',
  episode: 'Episode',
  trailer: 'Trailer',
  behindTheScenes: 'Behind the scenes'
}

/**
 * Select the best label for a video group based on a known priority order.
 */
function getVideoLabel(
  label?: string | null
): (typeof VIDEO_LABEL_ORDER)[number] {
  if (!label) return 'collection'
  return VIDEO_LABEL_ORDER.includes(label as (typeof VIDEO_LABEL_ORDER)[number])
    ? (label as (typeof VIDEO_LABEL_ORDER)[number])
    : 'collection'
}

function isAiEdition(edition?: string | null): boolean {
  if (edition == null) return false
  const normalized = edition.toLowerCase()
  return AI_EDITIONS.some((marker) => normalized.includes(marker))
}

function getSubtitleStatus(subtitles?: Subtitle[] | null): 'human' | 'ai' | 'none' {
  if (subtitles == null || subtitles.length === 0) return 'none'
  const hasAi = subtitles.some((subtitle) => isAiEdition(subtitle.edition))
  const hasHuman = subtitles.some((subtitle) => !isAiEdition(subtitle.edition))
  if (hasHuman) return 'human'
  if (hasAi) return 'ai'
  return 'none'
}

function getVoiceoverStatus(variant?: VideoVariant | null): 'human' | 'ai' | 'none' {
  if (!variant) return 'none'
  const editionName = variant.videoEdition?.name
  if (editionName && isAiEdition(editionName)) return 'ai'
  return 'human'
}

function hasValue(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0)
}

function getMetaStatus(child: ChildVideo) {
  const hasTitle = hasValue(child.title?.[0]?.value ?? null)
  const hasDescription = hasValue(child.description?.[0]?.value ?? null)
  const hasQuestions = Boolean(
    child.studyQuestions?.some((question) => hasValue(question.value))
  )
  const hasBibleQuotes = Boolean(child.bibleCitations?.length)
  const hasTags = Boolean(child.keywords?.length)

  const completedCount = [
    hasTitle,
    hasDescription,
    hasQuestions,
    hasBibleQuotes,
    hasTags
  ].filter(Boolean).length

  return {
    status: completedCount === 0 ? 'none' : completedCount === 5 ? 'human' : 'ai',
    completedCount,
    totalCount: 5,
    fields: {
      title: hasTitle,
      description: hasDescription,
      questions: hasQuestions,
      bibleQuotes: hasBibleQuotes,
      tags: hasTags
    }
  }
}

function getTitleValue(
  title?: VideoText[],
  fallback = 'Untitled'
): string {
  return title?.[0]?.value ?? fallback
}

function buildWatchUrl(variantSlug?: string | null): string | null {
  if (!WATCH_URL || !variantSlug) return null
  const [videoId, languageId] = variantSlug.split('/')
  if (!videoId || !languageId) return null
  const base = WATCH_URL.replace(/\/$/, '')
  return `${base}/${videoId}.html/${languageId}.html`
}

/**
 * Returns a timestamp (ms) for sorting collections, with fallbacks to child dates.
 */
function getCollectionTimestamp(collection: CollectionVideo): number {
  const publishedAt = collection.publishedAt
  if (publishedAt) {
    const parsed = Date.parse(publishedAt)
    if (!Number.isNaN(parsed)) return parsed
  }
  const childDates =
    collection.children
      ?.map((child) => child.publishedAt)
      .filter((date): date is string => Boolean(date))
      .map((date) => Date.parse(date))
      .filter((timestamp) => !Number.isNaN(timestamp)) ?? []
  if (childDates.length > 0) {
    return Math.max(...childDates)
  }
  return 0
}

async function fetchCollections(languageId: string): Promise<CollectionVideo[]> {
  if (!GATEWAY_URL) return []

  const query = `
    query GetAllCollections($languageId: ID!) {
      videos(where: { labels: [collection, featureFilm, series, trailer, behindTheScenes], published: true }, limit: 2000) {
        id
        label
        publishedAt
        childrenCount
        title(languageId: $languageId, primary: true) {
          value
        }
        description(languageId: $languageId, primary: true) {
          value
        }
        studyQuestions(languageId: $languageId, primary: true) {
          value
        }
        bibleCitations {
          id
        }
        keywords {
          id
        }
        images(aspectRatio: banner) {
          mobileCinematicHigh
        }
        variant(languageId: $languageId) {
          slug
          videoEdition {
            name
          }
        }
        subtitles(languageId: $languageId) {
          edition
        }
        children {
          id
          publishedAt
          title(languageId: $languageId, primary: true) {
            value
          }
          description(languageId: $languageId, primary: true) {
            value
          }
          studyQuestions(languageId: $languageId, primary: true) {
            value
          }
          bibleCitations {
            id
          }
          keywords {
            id
          }
          images(aspectRatio: banner) {
            mobileCinematicHigh
          }
          variant(languageId: $languageId) {
            slug
            videoEdition {
              name
            }
          }
          subtitles(languageId: $languageId) {
            edition
          }
        }
      }
    }
  `

  const response = await fetch(GATEWAY_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-graphql-client-name': 'ai-media',
      'x-graphql-client-version':
        process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
    },
    body: JSON.stringify({ query, variables: { languageId } }),
    cache: 'force-cache'
  })

  const payload = (await response.json()) as CollectionsResponse

  if (!response.ok || payload.errors?.length) {
    const message =
      payload.errors?.map((error) => error.message).join(', ') ??
      'Unknown error'
    throw new Error(message)
  }

  return payload.data?.videos ?? []
}

type SearchParams = {
  languageId?: string
}

type ClientMeta = {
  tags: boolean
  description: boolean
  title: boolean
  questions: boolean
  bibleQuotes: boolean
  completed: number
  total: number
}

type ClientVideo = {
  id: string
  title: string
  subtitleStatus: 'human' | 'ai' | 'none'
  voiceoverStatus: 'human' | 'ai' | 'none'
  metaStatus: 'human' | 'ai' | 'none'
  meta: ClientMeta
  thumbnailUrl: string | null
  watchUrl: string | null
}

type ClientCollection = {
  id: string
  title: string
  label: (typeof VIDEO_LABEL_ORDER)[number]
  labelDisplay: string
  publishedAt: string | null
  sortTimestamp: number
  videos: ClientVideo[]
}

function mergeCoverageStatus(
  first: ClientVideo['subtitleStatus'],
  second: ClientVideo['subtitleStatus']
): ClientVideo['subtitleStatus'] {
  if (first === 'human' || second === 'human') return 'human'
  if (first === 'ai' || second === 'ai') return 'ai'
  return 'none'
}

function getMetaStatusFromFields(fields: {
  title: boolean
  description: boolean
  questions: boolean
  bibleQuotes: boolean
  tags: boolean
}): { status: ClientVideo['metaStatus']; completed: number } {
  const completed = [
    fields.title,
    fields.description,
    fields.questions,
    fields.bibleQuotes,
    fields.tags
  ].filter(Boolean).length
  if (completed === 0) return { status: 'none', completed }
  if (completed === 5) return { status: 'human', completed }
  return { status: 'ai', completed }
}

function mergeMeta(first: ClientMeta, second: ClientMeta): ClientMeta {
  const fields = {
    title: first.title || second.title,
    description: first.description || second.description,
    questions: first.questions || second.questions,
    bibleQuotes: first.bibleQuotes || second.bibleQuotes,
    tags: first.tags || second.tags
  }
  const { completed } = getMetaStatusFromFields(fields)
  return {
    ...fields,
    completed,
    total: 5
  }
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: SearchParams | Promise<SearchParams | undefined>
}) {
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams
  const requestedLanguageIds = resolvedSearchParams?.languageId
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean) ?? []
  const selectedLanguageIds = Array.from(
    new Set(
      requestedLanguageIds.filter((id) =>
        Object.prototype.hasOwnProperty.call(languageSlugs, id)
      )
    )
  )
  if (selectedLanguageIds.length === 0) {
    selectedLanguageIds.push(DEFAULT_LANGUAGE_ID)
  }

  const languageOptions = (() => {
    const selectedSet = new Set(selectedLanguageIds)
    const isAllKnown = selectedLanguageIds.every((id) =>
      DEFAULT_LANGUAGE_OPTIONS.some((option) => option.id === id)
    )
    if (selectedLanguageIds.length === 0 || isAllKnown) {
      return DEFAULT_LANGUAGE_OPTIONS
    }

    return [
      ...selectedLanguageIds
        .filter((id) => !DEFAULT_LANGUAGE_OPTIONS.some((option) => option.id === id))
        .map((id) => {
          const slug = languageSlugs[id]
          return {
            id,
            englishLabel: formatLanguageLabel(slug ?? id),
            nativeLabel: ''
          }
        }),
      ...DEFAULT_LANGUAGE_OPTIONS.filter((option) => !selectedSet.has(option.id))
    ]
  })()

  let collectionsByLanguage: CollectionVideo[][] = []
  let errorMessage: string | null = null

  if (GATEWAY_URL) {
    try {
      collectionsByLanguage = await Promise.all(
        selectedLanguageIds.map((languageId) => fetchCollections(languageId))
      )
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : 'Unable to load collections.'
    }
  }

  const preparedCollections = collectionsByLanguage.map((collections) =>
    collections.map((collection) => {
    const rawChildren = collection.children ?? []
    const children =
      rawChildren.length > 0
        ? rawChildren
        : [
            {
              id: collection.id,
              title: collection.title,
              description: collection.description ?? null,
              studyQuestions: collection.studyQuestions ?? null,
              bibleCitations: collection.bibleCitations ?? null,
              keywords: collection.keywords ?? null,
              images: collection.images ?? null,
              subtitles: collection.subtitles ?? null,
              variant: collection.variant ?? null
            }
          ]
      const label = getVideoLabel(collection.label)
      const sortTimestamp = getCollectionTimestamp(collection)
      return {
        id: collection.id,
        title: getTitleValue(collection.title, 'Untitled Collection'),
        label,
        labelDisplay: VIDEO_LABEL_DISPLAY[label],
        publishedAt: collection.publishedAt ?? null,
        sortTimestamp,
        videos: children.map((child) => {
          const meta = getMetaStatus(child)

          return {
            id: child.id,
            title: getTitleValue(child.title, child.id),
            subtitleStatus: getSubtitleStatus(child.subtitles),
            voiceoverStatus: getVoiceoverStatus(child.variant),
            metaStatus: meta.status,
            meta: {
              completed: meta.completedCount,
              total: meta.totalCount,
              ...meta.fields
            },
            thumbnailUrl: child.images?.[0]?.mobileCinematicHigh ?? null,
            watchUrl: buildWatchUrl(child.variant?.slug)
          }
        })
      }
    })
  )

  const collectionMap = new Map<string, ClientCollection>()
  for (const languageCollections of preparedCollections) {
    for (const collection of languageCollections) {
      const existing = collectionMap.get(collection.id)
      if (!existing) {
        collectionMap.set(collection.id, collection)
        continue
      }

      const mergedVideos = new Map<string, ClientVideo>()
      for (const video of existing.videos) {
        mergedVideos.set(video.id, { ...video })
      }
      for (const video of collection.videos) {
        const current = mergedVideos.get(video.id)
        if (!current) {
          mergedVideos.set(video.id, { ...video })
          continue
        }

        const mergedMeta = mergeMeta(current.meta, video.meta)
        const metaStatus = getMetaStatusFromFields(mergedMeta).status
        mergedVideos.set(video.id, {
          ...current,
          title: hasValue(current.title) ? current.title : video.title,
          subtitleStatus: mergeCoverageStatus(current.subtitleStatus, video.subtitleStatus),
          voiceoverStatus: mergeCoverageStatus(current.voiceoverStatus, video.voiceoverStatus),
          meta: mergedMeta,
          metaStatus,
          thumbnailUrl: current.thumbnailUrl ?? video.thumbnailUrl,
          watchUrl: current.watchUrl ?? video.watchUrl
        })
      }

      collectionMap.set(collection.id, {
        ...existing,
        title: hasValue(existing.title) ? existing.title : collection.title,
        label: existing.label ?? collection.label,
        labelDisplay: existing.labelDisplay ?? collection.labelDisplay,
        publishedAt: existing.publishedAt ?? collection.publishedAt,
        sortTimestamp: Math.max(existing.sortTimestamp, collection.sortTimestamp),
        videos: Array.from(mergedVideos.values())
      })
    }
  }

  const sortedCollections = Array.from(collectionMap.values()).sort(
    (first, second) => second.sortTimestamp - first.sortTimestamp
  )

  return (
    <CoverageReportClient
      gatewayConfigured={Boolean(GATEWAY_URL)}
      errorMessage={errorMessage}
      collections={sortedCollections}
      selectedLanguageIds={selectedLanguageIds}
      languageOptions={languageOptions}
    />
  )
}
