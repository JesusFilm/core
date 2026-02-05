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

type ChildVideo = {
  id: string
  title?: Array<{ value: string | null }>
  subtitles?: Subtitle[] | null
  variant?: { slug?: string | null } | null
}

type CollectionVideo = {
  id: string
  title?: Array<{ value: string | null }>
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

function getTitleValue(
  title?: Array<{ value: string | null }>,
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

async function fetchCollections(languageId: string): Promise<CollectionVideo[]> {
  if (!GATEWAY_URL) return []

  const query = `
    query GetAllCollections($languageId: ID!) {
      videos(where: { labels: [collection], published: true }, limit: 2000) {
        id
        childrenCount
        title(languageId: $languageId, primary: true) {
          value
        }
        children {
          id
          title(languageId: $languageId, primary: true) {
            value
          }
          variant(languageId: $languageId) {
            slug
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
    cache: 'no-store'
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

export default async function HomePage({
  searchParams
}: {
  searchParams?: SearchParams | Promise<SearchParams | undefined>
}) {
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams
  const requestedLanguageId = resolvedSearchParams?.languageId
  const selectedLanguageId =
    requestedLanguageId &&
    DEFAULT_LANGUAGE_OPTIONS.some(
      (language) => language.id === requestedLanguageId
    )
      ? requestedLanguageId
      : DEFAULT_LANGUAGE_ID

  let collections: CollectionVideo[] = []
  let errorMessage: string | null = null

  if (GATEWAY_URL) {
    try {
      collections = await fetchCollections(selectedLanguageId)
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : 'Unable to load collections.'
    }
  }

  const preparedCollections = collections.map((collection) => {
    const children = collection.children ?? []
    return {
      id: collection.id,
      title: getTitleValue(collection.title, 'Untitled Collection'),
      videos: children.map((child) => ({
        id: child.id,
        title: getTitleValue(child.title, child.id),
        status: getSubtitleStatus(child.subtitles),
        watchUrl: buildWatchUrl(child.variant?.slug)
      }))
    }
  })

  return (
    <CoverageReportClient
      gatewayConfigured={Boolean(GATEWAY_URL)}
      errorMessage={errorMessage}
      collections={preparedCollections}
      selectedLanguageId={selectedLanguageId}
      languageOptions={DEFAULT_LANGUAGE_OPTIONS}
    />
  )
}
