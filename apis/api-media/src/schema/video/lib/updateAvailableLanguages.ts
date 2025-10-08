// Shared logic for calculating and updating video availableLanguages
// Single source of truth for managing availableLanguages on videos
// Handles both regular videos and collections
// Used by video.ts and videoVariant.ts

import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../../lib/algolia/algoliaVideoUpdate'
import { videoCacheReset } from '../../../lib/videoCacheReset'

// Calculates what availableLanguages should be for a given video
// Does NOT update the database - only calculates the correct value
export async function calculateAvailableLanguages(
  videoId: string
): Promise<string[]> {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    select: {
      label: true,
      variants: {
        where: { published: true },
        select: { languageId: true }
      },
      children: {
        where: { published: true },
        select: { availableLanguages: true }
      }
    }
  })

  if (video == null) {
    return []
  }

  const isCollection = ['collection', 'series', 'featureFilm'].includes(
    video.label
  )

  if (isCollection && video.children.length > 0) {
    // For collections: aggregate availableLanguages from all published children
    const childLanguages = new Set<string>()
    for (const child of video.children) {
      for (const lang of child.availableLanguages) {
        childLanguages.add(lang)
      }
    }
    return Array.from(childLanguages).sort((a, b) => Number(a) - Number(b))
  } else if (!isCollection) {
    // For regular videos: get languages from published variants
    return video.variants
      .map((v) => v.languageId)
      .sort((a, b) => Number(a) - Number(b))
  }

  return []
}

// Updates a video's availableLanguages field based on current state
// Handles both regular videos and collections
export async function updateVideoAvailableLanguages(
  videoId: string,
  options: {
    skipCache?: boolean
    skipAlgolia?: boolean
  } = {}
): Promise<string[]> {
  const availableLanguages = await calculateAvailableLanguages(videoId)

  // Update the video
  await prisma.video.update({
    where: { id: videoId },
    data: {
      availableLanguages: {
        set: availableLanguages
      }
    }
  })

  // Update cache and search index unless skipped
  if (!options.skipAlgolia) {
    try {
      await updateVideoInAlgolia(videoId)
    } catch (error) {
      console.error('Algolia update error:', error)
    }
  }

  if (!options.skipCache) {
    try {
      await videoCacheReset(videoId)
    } catch (error) {
      console.error('Cache reset error:', error)
    }
  }

  return availableLanguages
}

// Adds a language to a video's availableLanguages if not already present
// Uses atomic operation to prevent duplicates
export async function addLanguageToVideo(
  videoId: string,
  languageId: string
): Promise<void> {
  try {
    await prisma.video.update({
      where: {
        id: videoId,
        NOT: {
          availableLanguages: {
            has: languageId
          }
        }
      },
      data: {
        availableLanguages: {
          push: languageId
        }
      }
    })
  } catch {
    // If update fails (e.g., language already exists), that's fine
    // We just wanted to ensure it's in the array
  }
}

// Removes a language from a video's availableLanguages if no published variants use it
// Uses transaction to ensure consistency
export async function removeLanguageFromVideoIfUnused(
  videoId: string,
  languageId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const video = await tx.video.findUnique({
      where: { id: videoId },
      select: { availableLanguages: true }
    })

    if (video == null) return

    // Check if there are any other published variants with this language
    const hasOtherVariants = await tx.videoVariant.count({
      where: { videoId, languageId, published: true }
    })

    // Only remove if no published variants use this language
    if (hasOtherVariants === 0) {
      await tx.video.update({
        where: { id: videoId },
        data: {
          availableLanguages: {
            set: video.availableLanguages.filter(
              (lang: string) => lang !== languageId
            )
          }
        }
      })
    }
  })
}

// Updates all parent videos (collections) when a child video's languages change
// Ensures collections always reflect the union of their children's languages
export async function updateParentCollectionLanguages(
  childVideoId: string
): Promise<void> {
  const parents = await prisma.video.findMany({
    where: {
      children: {
        some: { id: childVideoId }
      },
      label: {
        in: ['collection', 'series', 'featureFilm']
      }
    },
    select: { id: true }
  })

  // Update each parent collection
  for (const parent of parents) {
    await updateVideoAvailableLanguages(parent.id, {
      skipCache: false,
      skipAlgolia: false
    })
  }
}

