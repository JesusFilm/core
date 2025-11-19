import { useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

import { VideoLabel } from '../../../__generated__/globalTypes'
import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { getLanguageIdFromLocale } from '../../libs/getLanguageIdFromLocale'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'

import { GET_COLLECTION_SHOWCASE_CONTENT } from './queries'

export type ShowcaseSourceType = 'collection' | 'video'
export type ShowcaseIdType = 'databaseId' | 'slug'

export interface SectionVideoCollectionCarouselSource {
  id: string
  type: ShowcaseSourceType
  idType?: ShowcaseIdType
  limitChildren?: number
}

export interface SectionVideoCollectionCarouselSlide {
  id: string
  title: string
  href: string
  imageUrl: string
  alt: string
  label?: VideoLabel
  snippet?: string
  parentId?: string
  containerSlug?: string
  variantSlug: string
  video: VideoChildFields
}

export interface SectionVideoCollectionCarouselContentResult {
  loading: boolean
  slides: SectionVideoCollectionCarouselSlide[]
  subtitle?: string
  title?: string
  description?: string
  ctaLabel: string
  ctaHref: string
  primaryCollection?: ShowcaseVideoNode
}

interface FlattenOptions {
  limit?: number
}

interface ShowcaseTextField {
  __typename?:
    | 'VideoTitle'
    | 'VideoSnippet'
    | 'VideoDescription'
    | 'VideoImageAlt'
  value: string
}

interface ShowcaseImage {
  __typename?: 'CloudflareImage'
  mobileCinematicHigh: string | null
}

interface ShowcaseVariant {
  __typename?: 'VideoVariant'
  id: string
  duration: number
  hls?: string | null
  slug?: string | null
}

interface ShowcaseParent {
  __typename?: 'Video'
  id: string
  slug?: string | null
  label: VideoLabel
}

interface ShowcaseVideoNode {
  __typename?: 'Video'
  id: string
  label: VideoLabel
  slug: string
  title?: ShowcaseTextField[] | null
  snippet?: ShowcaseTextField[] | null
  imageAlt?: ShowcaseTextField[] | null
  posterImages?: ShowcaseImage[] | null
  bannerImages?: ShowcaseImage[] | null
  variant?: ShowcaseVariant | null
  parents?: (ShowcaseParent | null)[] | null
  childrenCount: number
  description?: ShowcaseTextField[] | null
  children?: (ShowcaseVideoNode | null)[] | null
}

type CollectionNode = ShowcaseVideoNode
type VideoNode = ShowcaseVideoNode
type MaybeCollection = ShowcaseVideoNode

interface CollectionShowcaseQueryData {
  collections?: ShowcaseVideoNode[] | null
  videos?: ShowcaseVideoNode[] | null
}

interface CollectionShowcaseQueryVars {
  collectionIds?: string[]
  videoIds?: string[]
  languageId: string
}

function selectImageUrl(node: MaybeCollection | VideoNode): string | undefined {
  const poster = node.posterImages?.find(
    (image) => image?.mobileCinematicHigh != null
  )
  if (poster?.mobileCinematicHigh != null) return poster.mobileCinematicHigh

  const banner = node.bannerImages?.find(
    (image) => image?.mobileCinematicHigh != null
  )
  if (banner?.mobileCinematicHigh != null) return banner.mobileCinematicHigh

  return undefined
}

function selectAltText(node: MaybeCollection | VideoNode): string | undefined {
  const alt = node.imageAlt?.find((text) => text?.value != null)?.value
  if (alt != null && alt !== '') return alt
  const title = node.title?.find((value) => value?.value != null)?.value
  return title
}

function getContainerSlug(
  node: MaybeCollection | VideoNode
): string | undefined {
  const parentWithSlug = node.parents?.find((parent) => parent?.slug != null)
  return parentWithSlug?.slug ?? undefined
}

function buildVideoSnapshot(
  node: VideoNode,
  imageUrl: string,
  altText: string,
  slideTitle: string,
  variantSlug: string
): VideoChildFields {
  const mapTextFields = (
    fields: (ShowcaseTextField | null)[] | null | undefined,
    typename: 'VideoTitle' | 'VideoSnippet' | 'VideoImageAlt'
  ): { __typename: typeof typename; value: string }[] => {
    const mapped = (fields ?? [])
      .filter(
        (field): field is ShowcaseTextField =>
          field?.value != null && field.value !== ''
      )
      .map((field) => ({
        __typename: typename,
        value: field.value
      }))

    if (mapped.length > 0) return mapped

    if (typename === 'VideoTitle') {
      return [
        {
          __typename: 'VideoTitle',
          value: slideTitle
        }
      ]
    }

    if (typename === 'VideoImageAlt' && altText !== '') {
      return [
        {
          __typename: 'VideoImageAlt',
          value: altText
        }
      ]
    }

    return []
  }

  const candidateImages = [
    ...(node.posterImages ?? []),
    ...(node.bannerImages ?? [])
  ]
    .filter(
      (image): image is ShowcaseImage => image?.mobileCinematicHigh != null
    )
    .map((image) => ({
      __typename: image.__typename ?? 'CloudflareImage',
      mobileCinematicHigh: image.mobileCinematicHigh
    }))

  const images =
    candidateImages.length > 0
      ? candidateImages
      : [
          {
            __typename: 'CloudflareImage' as const,
            mobileCinematicHigh: imageUrl
          }
        ]

  return {
    __typename: 'Video',
    id: node.id,
    label: node.label,
    title: mapTextFields(node.title, 'VideoTitle'),
    images,
    imageAlt: mapTextFields(node.imageAlt, 'VideoImageAlt'),
    snippet: mapTextFields(node.snippet, 'VideoSnippet'),
    slug: node.slug,
    variant:
      node.variant != null
        ? {
            __typename: 'VideoVariant',
            id: node.variant.id,
            duration: node.variant.duration,
            hls: node.variant.hls ?? null,
            slug: variantSlug
          }
        : null,
    childrenCount: node.childrenCount
  }
}

function buildSlide(
  node: VideoNode,
  parentId?: string,
  debugContext?: { collectionId?: string; isLumoSection?: boolean }
): SectionVideoCollectionCarouselSlide | null {
  const variantSlug = node.variant?.slug
  if (variantSlug == null || variantSlug === '') {
    if (debugContext?.isLumoSection) {
      console.warn(
        `⚠️ [Scripture Section] buildSlide: No variant for ${node.id} (${node.title?.[0]?.value ?? 'no title'})`
      )
    }
    return null
  }

  const containerSlug = getContainerSlug(node)
  const href = getWatchUrl(containerSlug, node.label, variantSlug)
  const imageUrl = selectImageUrl(node)
  if (imageUrl == null) {
    if (debugContext?.isLumoSection) {
      console.warn(
        `⚠️ [Scripture Section] buildSlide: No imageUrl for ${node.id} (${node.title?.[0]?.value ?? 'no title'})`
      )
    }
    return null
  }

  const title = node.title?.[0]?.value ?? ''
  const alt = selectAltText(node) ?? title

  return {
    id: node.id,
    title,
    href,
    imageUrl,
    alt,
    label: node.label,
    snippet: node.snippet?.[0]?.value ?? undefined,
    parentId,
    containerSlug,
    variantSlug,
    video: buildVideoSnapshot(node, imageUrl, alt, title, variantSlug)
  }
}

function flattenCollection(
  collection: CollectionNode,
  options?: FlattenOptions,
  debugContext?: { isLumoSection?: boolean }
): (SectionVideoCollectionCarouselSlide | null)[] {
  const children = collection.children ?? []
  const slides: (SectionVideoCollectionCarouselSlide | null)[] = []
  const limit = options?.limit ?? children.length

  if (debugContext?.isLumoSection) {
    console.log(`🔍 [Scripture Section] flattenCollection for ${collection.id}:`, {
      totalChildren: children.length,
      limit,
      childrenLabels: children.map((c) => ({
        id: c?.id,
        label: c?.label,
        hasVariant: c?.variant != null,
        variantSlug: c?.variant?.slug,
        childrenCount: c?.children?.length ?? 0
      }))
    })
  }

  for (const child of children) {
    if (slides.length >= limit) break

    if (child == null) continue

    if (child.label === VideoLabel.collection && child.children != null) {
      if (debugContext?.isLumoSection) {
        console.log(
          `📁 [Scripture Section] Child ${child.id} is a collection with ${child.children.length} grandchildren`
        )
      }
      for (const grandchild of child.children) {
        if (slides.length >= limit) break
        if (grandchild == null) continue
        const slide = buildSlide(grandchild, child.id, {
          collectionId: collection.id,
          isLumoSection: debugContext?.isLumoSection
        })
        if (slide != null) {
          slides.push(slide)
        }
      }
    } else {
      const slide = buildSlide(child, collection.id, {
        collectionId: collection.id,
        isLumoSection: debugContext?.isLumoSection
      })
      if (slide != null) {
        slides.push(slide)
      }
    }
  }

  return slides
}

export interface UseSectionVideoCollectionCarouselContentOptions {
  sources: SectionVideoCollectionCarouselSource[]
  primaryCollectionId?: string
  subtitleOverride?: string
  titleOverride?: string
  descriptionOverride?: string
  ctaLabelOverride?: string
  ctaHrefOverride?: string
  defaultCtaLabel: string
  languageId?: string
}

export function useSectionVideoCollectionCarouselContent({
  sources,
  primaryCollectionId,
  subtitleOverride,
  titleOverride,
  descriptionOverride,
  ctaLabelOverride,
  ctaHrefOverride,
  defaultCtaLabel,
  languageId: providedLanguageId
}: UseSectionVideoCollectionCarouselContentOptions): SectionVideoCollectionCarouselContentResult {
  const { locale } = useRouter()
  const languageId = providedLanguageId ?? getLanguageIdFromLocale(locale)

  useEffect(() => {
    const slugSources = sources.filter((source) => source.idType === 'slug')
    if (slugSources.length > 0) {
      console.warn(
        'SectionVideoCollectionCarousel currently expects databaseId values; slug idType is not fully supported yet.',
        slugSources
      )
    }
  }, [sources])

  const collectionSources = useMemo(
    () => sources.filter((source) => source.type === 'collection'),
    [sources]
  )
  const videoSources = useMemo(
    () => sources.filter((source) => source.type === 'video'),
    [sources]
  )

  const queryVariables = {
    collectionIds:
      collectionSources.length > 0
        ? collectionSources.map((source) => source.id)
        : undefined,
    videoIds:
      videoSources.length > 0
        ? videoSources.map((source) => source.id)
        : undefined,
    languageId
  }

  const { data, loading } = useQuery<
    CollectionShowcaseQueryData,
    CollectionShowcaseQueryVars
  >(GET_COLLECTION_SHOWCASE_CONTENT, {
    variables: queryVariables,
    skip: collectionSources.length === 0 && videoSources.length === 0,
    // Use cache-and-network to prevent cache collisions
    // When queries with specific IDs are made, other queries that fetch all items
    // might overwrite the cache. Using cache-and-network ensures we always get
    // the correct results from the network when needed.
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  })

  const slides = useMemo(() => {
    if (data == null) return []

    const slideAccumulator: SectionVideoCollectionCarouselSlide[] = []
    const seen = new Set<string>()

    const collectionsById = new Map(
      (data.collections ?? []).map((collection) => [collection.id, collection])
    )
    const videosById = new Map(
      (data.videos ?? []).map((video) => [video.id, video])
    )

    // Debug logging for "Scripture, Spoken Exactly as Written" section
    const isLumoSection = sources.some(
      (s) => s.type === 'collection' && s.id === 'LUMOCollection'
    )
    // Debug logging for "Christmas Advent Countdown" section
    const isChristmasAdventSection = sources.some(
      (s) => s.type === 'video' && s.id === '2_0-ConsideringChristmas'
    )
    
    if (isLumoSection) {
      console.log('🔍 [Scripture Section] Query data:', {
        collectionsCount: data.collections?.length ?? 0,
        videosCount: data.videos?.length ?? 0,
        requestedCollectionIds: sources
          .filter((s) => s.type === 'collection')
          .map((s) => s.id),
        foundCollectionIds: Array.from(collectionsById.keys())
      })
    }
    
    if (isChristmasAdventSection) {
      console.log('🎄 [Christmas Advent Section] Query data:', {
        collectionsCount: data.collections?.length ?? 0,
        videosCount: data.videos?.length ?? 0,
        requestedVideoIds: sources
          .filter((s) => s.type === 'video')
          .map((s) => s.id),
        foundVideoIds: Array.from(videosById.keys()),
        missingVideoIds: sources
          .filter((s) => s.type === 'video')
          .map((s) => s.id)
          .filter((id) => !videosById.has(id))
      })
    }

    for (const source of sources) {
      if (source.type === 'collection') {
        const collection = collectionsById.get(source.id)
        if (collection == null) {
          if (isLumoSection) {
            console.warn(`🚨 [Scripture Section] Collection not found: ${source.id}`)
          }
          continue
        }
        if (isLumoSection) {
          console.log(`✅ [Scripture Section] Found collection ${source.id}:`, {
            childrenCount: collection.children?.length ?? 0,
            limitChildren: source.limitChildren
          })
        }
        const flattened = flattenCollection(
          collection,
          {
            limit: source.limitChildren
          },
          { isLumoSection }
        )
        if (isLumoSection) {
          console.log(`📊 [Scripture Section] Flattened ${source.id}:`, {
            totalFlattened: flattened.length,
            validSlides: flattened.filter((s) => s != null).length,
            nullSlides: flattened.filter((s) => s == null).length
          })
        }
        for (const slide of flattened) {
          if (slide == null) continue
          const key = slide.href
          if (seen.has(key)) continue
          seen.add(key)
          slideAccumulator.push(slide)
        }
      } else {
        const video = videosById.get(source.id)
        if (video == null) {
          if (isChristmasAdventSection) {
            console.warn(`🚨 [Christmas Advent Section] Video not found: ${source.id}`)
          }
          continue
        }
        if (isChristmasAdventSection) {
          console.log(`✅ [Christmas Advent Section] Found video ${source.id}:`, {
            title: video.title?.[0]?.value ?? 'no title',
            hasVariant: video.variant != null,
            variantSlug: video.variant?.slug,
            hasImage: selectImageUrl(video) != null
          })
        }
        const slide = buildSlide(video, undefined, {
          isLumoSection: isChristmasAdventSection
        })
        if (slide == null) {
          if (isChristmasAdventSection) {
            console.warn(`⚠️ [Christmas Advent Section] buildSlide returned null for ${source.id}`)
          }
          continue
        }
        const key = slide.href
        if (seen.has(key)) {
          if (isChristmasAdventSection) {
            console.warn(`⚠️ [Christmas Advent Section] Duplicate slide skipped: ${source.id} (href: ${key})`)
          }
          continue
        }
        seen.add(key)
        slideAccumulator.push(slide)
      }
    }

    if (isLumoSection) {
      console.log(`🎯 [Scripture Section] Final slides count: ${slideAccumulator.length}`)
    }
    
    if (isChristmasAdventSection) {
      console.log(`🎯 [Christmas Advent Section] Final slides count: ${slideAccumulator.length}`, {
        slideIds: slideAccumulator.map((s) => s.id),
        slideTitles: slideAccumulator.map((s) => s.title)
      })
    }

    return slideAccumulator
  }, [data, sources])

  const primaryCollection = useMemo(() => {
    if (data?.collections == null || data.collections.length === 0)
      return undefined
    if (primaryCollectionId != null) {
      return data.collections.find(
        (collection) => collection.id === primaryCollectionId
      )
    }
    const firstSource = collectionSources[0]
    if (firstSource != null) {
      return data.collections.find(
        (collection) => collection.id === firstSource.id
      )
    }
    return data.collections[0]
  }, [collectionSources, data, primaryCollectionId])

  const subtitle = subtitleOverride ?? primaryCollection?.snippet?.[0]?.value
  const title = titleOverride ?? primaryCollection?.title?.[0]?.value

  const description =
    descriptionOverride ?? primaryCollection?.description?.[0]?.value

  const ctaHref =
    ctaHrefOverride ??
    (primaryCollection?.variant?.slug != null
      ? getWatchUrl(
          primaryCollection.slug,
          primaryCollection.label,
          primaryCollection.variant.slug
        )
      : '/watch')

  const ctaLabel = ctaLabelOverride ?? defaultCtaLabel

  return {
    loading,
    slides,
    subtitle,
    title,
    description,
    ctaLabel,
    ctaHref,
    primaryCollection
  }
}
