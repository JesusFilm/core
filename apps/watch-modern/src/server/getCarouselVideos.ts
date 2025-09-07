/**
 * Server-side data assembler for home video carousel.
 * Fetches video data from GraphQL Gateway API for the curated carousel.
 */

import { fetchGraphql } from '@/lib/graphql/fetchGraphql'
import { getLanguageIdFromLocale } from '@/lib/i18n/getLanguageIdFromLocale'
import { errorTelemetry } from '@/lib/telemetry'

// Types based on legacy VideoContentFields but simplified for carousel needs
export interface CarouselVideoItem {
  id: string
  label: string
  title: string
  description: string
  slug: string
  variantSlug: string | null
  hlsUrl: string | null
  imageUrl: string | null
  variantLanguagesCount: number
  languageSlugOverride: string | null
}

export interface CarouselSlug {
  slug: string
  languageSlugOverride?: string | null
}

// GraphQL query for individual carousel video - simplified version of legacy VideoContentFields
const GET_CAROUSEL_VIDEO = `
  query GetCarouselVideo($slug: ID!, $languageId: ID) {
    video(id: $slug, idType: databaseId) {
      id
      label
      title(languageId: $languageId, primary: true) {
        value
      }
      description(languageId: $languageId, primary: true) {
        value
      }
      slug
      variant {
        slug
        hls
      }
      images(aspectRatio: banner) {
        mobileCinematicHigh
      }
      variantLanguagesCount
    }
  }
`

export interface CarouselVideoResponse {
  video: {
    id: string
    label: string
    title: Array<{
      value: string
    }>
    description: Array<{
      value: string
    }>
    slug: string
    variant: {
      slug: string
      hls: string | null
    } | null
    images: Array<{
      mobileCinematicHigh: string | null
    }>
    variantLanguagesCount: number
  } | null
}

/**
 * Fetches carousel video data for the given slugs and locale.
 * @param slugs - Array of curated video slugs
 * @param locale - User's locale for content localization
 * @param maxItems - Maximum number of items to return (default: 10)
 * @returns Array of carousel video items, tolerant to missing videos
 */
export async function getCarouselVideos(
  slugs: CarouselSlug[],
  locale: string,
  maxItems: number = 10
): Promise<CarouselVideoItem[]> {
  console.log('🎬 [DEBUG] getCarouselVideos called with:', {
    slugCount: slugs.length,
    locale,
    maxItems,
    slugs: slugs.map(s => s.slug)
  })

  try {
    const languageId = getLanguageIdFromLocale(locale)
    console.log('🎬 [DEBUG] Resolved languageId:', languageId)

    const carouselItems: CarouselVideoItem[] = []

    // Fetch videos individually to handle missing videos gracefully
    const slugsToProcess = slugs.slice(0, maxItems)
    console.log('🎬 [DEBUG] Processing', slugsToProcess.length, 'slugs:', slugsToProcess.map(s => s.slug))

    for (const slugConfig of slugsToProcess) {
      console.log('🎬 [DEBUG] Fetching video for slug:', slugConfig.slug)

      try {
        const response = await fetchGraphql<CarouselVideoResponse>(
          GET_CAROUSEL_VIDEO,
          {
            slug: slugConfig.slug,
            languageId,
          }
        )

        console.log('🎬 [DEBUG] GraphQL response for', slugConfig.slug, ':', {
          hasData: !!response.data,
          hasVideo: !!response.data?.video,
          videoId: response.data?.video?.id || 'none'
        })

        if (response.data?.video) {
          const video = response.data.video
          const carouselItem = {
            id: video.id,
            label: video.label,
            title: video.title?.[0]?.value || 'Untitled Video',
            description: video.description?.[0]?.value || 'No description available',
            slug: video.slug,
            variantSlug: video.variant?.slug || null,
            hlsUrl: video.variant?.hls || null,
            imageUrl: video.images?.[0]?.mobileCinematicHigh || null,
            variantLanguagesCount: video.variantLanguagesCount,
            languageSlugOverride: slugConfig.languageSlugOverride || null,
          }

          carouselItems.push(carouselItem)
          console.log('✅ [DEBUG] Successfully added video:', {
            slug: slugConfig.slug,
            id: video.id,
            title: carouselItem.title,
            hasHlsUrl: !!carouselItem.hlsUrl,
            hasImageUrl: !!carouselItem.imageUrl
          })
        } else {
          console.warn('⚠️ [DEBUG] Video not found for slug:', slugConfig.slug)
        }
      } catch (videoError) {
        console.error('❌ [DEBUG] Failed to fetch video for slug', slugConfig.slug, ':', videoError)
        // Continue with other videos instead of failing completely
      }
    }

    console.log('🎬 [DEBUG] Final result:', {
      totalSlugsProcessed: slugsToProcess.length,
      successfulVideos: carouselItems.length,
      videos: carouselItems.map(v => ({
        slug: v.slug,
        title: v.title,
        hasHlsUrl: !!v.hlsUrl
      }))
    })

    return carouselItems
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('💥 [DEBUG] Critical error in getCarouselVideos:', error)

    // Log GraphQL error for monitoring (server-side telemetry would be handled by monitoring systems)
    // In production, this would be sent to error monitoring services
    if (typeof window !== 'undefined') {
      errorTelemetry.graphqlError(errorMessage, 'GetCarouselVideo')
    }

    // Return empty array on error to prevent breaking the page
    return []
  }
}
