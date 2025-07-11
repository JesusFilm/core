import compact from 'lodash/compact'

import { Platform } from '.prisma/api-media-client'

import { prisma } from '../../lib/prisma'
import {
  videoCacheReset,
  videoVariantCacheReset
} from '../../lib/videoCacheReset'
import { updateVideoVariantInAlgolia } from '../../workers/algolia/service'
import { builder } from '../builder'
import { deleteR2File } from '../cloudflare/r2/asset'
import { Language } from '../language'
import { deleteVideo } from '../mux/video/service'

import { VideoVariantCreateInput } from './inputs/videoVariantCreate'
import { VideoVariantFilter } from './inputs/videoVariantFilter'
import { VideoVariantUpdateInput } from './inputs/videoVariantUpdate'

// Helper function to validate and extract language slug from a variant slug
function extractLanguageSlugFromVariantSlug(
  variantSlug: string
): string | null {
  if (!variantSlug || typeof variantSlug !== 'string') {
    return null
  }

  const lastSlashIndex = variantSlug.lastIndexOf('/')
  if (lastSlashIndex === -1 || lastSlashIndex === variantSlug.length - 1) {
    // No slash found or slash is the last character
    return null
  }

  const extractedSlug = variantSlug.substring(lastSlashIndex + 1)

  // Validate that the extracted slug is not empty and contains valid slug characters
  if (!extractedSlug || !/^[a-z0-9-_]+$/i.test(extractedSlug)) {
    return null
  }

  return extractedSlug
}

// Helper function to create empty video variant for parent video
async function createEmptyParentVariant(
  parentVideoId: string,
  languageId: string,
  languageSlug?: string
) {
  // Check if parent variant already exists for this language
  const existingVariant = await prisma.videoVariant.findFirst({
    where: {
      videoId: parentVideoId,
      languageId: languageId
    }
  })

  if (existingVariant) {
    return existingVariant
  }

  // Get parent video info and language slug in one query if not provided
  const [parentVideo, existingVariantWithLanguage] = await Promise.all([
    prisma.video.findUnique({
      where: { id: parentVideoId },
      select: { slug: true, availableLanguages: true }
    }),
    languageSlug
      ? null
      : prisma.videoVariant.findFirst({
          where: { languageId: languageId },
          select: { slug: true }
        })
  ])

  if (!parentVideo) {
    throw new Error(`Parent video with id ${parentVideoId} not found`)
  }

  // Use provided languageSlug or extract from existing variant with validation
  let resolvedLanguageSlug: string
  if (languageSlug) {
    resolvedLanguageSlug = languageSlug
  } else if (existingVariantWithLanguage?.slug) {
    // Safely extract language slug from existing variant slug
    const extractedSlug = extractLanguageSlugFromVariantSlug(
      existingVariantWithLanguage.slug
    )
    if (!extractedSlug) {
      throw new Error(
        `Invalid slug format in existing variant: ${existingVariantWithLanguage.slug}. Cannot extract language slug.`
      )
    }
    resolvedLanguageSlug = extractedSlug
  } else {
    throw new Error(
      `Cannot determine language slug for languageId: ${languageId}. No existing variant found and no languageSlug provided.`
    )
  }

  // Create empty variant for parent video and update available languages in a single transaction
  const currentLanguages = parentVideo.availableLanguages || []
  const updatedLanguages = Array.from(
    new Set([...currentLanguages, languageId])
  )

  const newVariant = await prisma.$transaction(async (tx) => {
    const variant = await tx.videoVariant.create({
      data: {
        id: `${languageId}_${parentVideoId}`,
        videoId: parentVideoId,
        edition: 'base',
        languageId: languageId,
        slug: `${parentVideo.slug}/${resolvedLanguageSlug}`,
        hls: '',
        dash: '',
        share: '',
        downloadable: false,
        published: true,
        duration: 0,
        lengthInMilliseconds: 0
      }
    })

    await tx.video.update({
      where: { id: parentVideoId },
      data: { availableLanguages: updatedLanguages }
    })

    return variant
  })

  return newVariant
}

// Helper function to handle parent variant creation for child videos
export async function handleParentVariantCreation(
  videoId: string,
  languageId: string
) {
  // Get the video info (label + published status) and find parent videos in parallel
  const [video, parentVideos, childVariant] = await Promise.all([
    prisma.video.findUnique({
      where: { id: videoId },
      select: { label: true, published: true }
    }),
    prisma.video.findMany({
      where: {
        childIds: {
          has: videoId
        }
      },
      select: { id: true }
    }),
    prisma.videoVariant.findFirst({
      where: {
        videoId: videoId,
        languageId: languageId
      },
      select: { published: true }
    })
  ])

  // Only create parent variants if:
  // 1. Video exists and is not a feature film
  // 2. Video is published
  // 3. Video variant is published
  // 4. Video has parent videos
  if (
    !video ||
    video.label === 'featureFilm' ||
    !video.published ||
    !childVariant?.published ||
    parentVideos.length === 0
  ) {
    return
  }

  // Get language slug once for all parent variants
  const existingVariantWithLanguage = await prisma.videoVariant.findFirst({
    where: { languageId: languageId },
    select: { slug: true }
  })

  // Safely extract language slug from existing variant with validation
  let languageSlug: string
  if (existingVariantWithLanguage?.slug) {
    const extractedSlug = extractLanguageSlugFromVariantSlug(
      existingVariantWithLanguage.slug
    )
    if (!extractedSlug) {
      throw new Error(
        `Invalid slug format in existing variant: ${existingVariantWithLanguage.slug}. Cannot extract language slug.`
      )
    }
    languageSlug = extractedSlug
  } else {
    throw new Error(
      `Cannot determine language slug for languageId: ${languageId}. No existing variant found.`
    )
  }

  // Create empty variants for all parent videos in parallel
  const promises = parentVideos.map((parent) =>
    createEmptyParentVariant(parent.id, languageId, languageSlug).catch(
      (error) => {
        console.error(
          `Failed to create empty variant for parent ${parent.id}:`,
          error
        )
      }
    )
  )

  await Promise.allSettled(promises)
}

// Helper function to handle parent variant cleanup for child videos
export async function handleParentVariantCleanup(
  videoId: string,
  languageId: string
) {
  // Get the video label and find parent videos in parallel
  const [video, parentVideos] = await Promise.all([
    prisma.video.findUnique({
      where: { id: videoId },
      select: { label: true }
    }),
    prisma.video.findMany({
      where: {
        childIds: {
          has: videoId
        }
      },
      select: { id: true }
    })
  ])

  if (!video || video.label === 'featureFilm' || parentVideos.length === 0) {
    return
  }

  // Check and remove empty variants for all parent videos in parallel
  const promises = parentVideos.map((parent) =>
    checkAndRemoveEmptyParentVariant(parent.id, languageId).catch((error) => {
      console.error(
        `Failed to cleanup empty variant for parent ${parent.id}:`,
        error
      )
    })
  )

  await Promise.allSettled(promises)
}

// Updated helper function to check if empty parent variant should be removed
async function checkAndRemoveEmptyParentVariant(
  parentVideoId: string,
  languageId: string
) {
  // Get parent video with children and available languages in one query
  const parentVideo = await prisma.video.findUnique({
    where: { id: parentVideoId },
    select: {
      childIds: true,
      availableLanguages: true
    }
  })

  if (!parentVideo || !parentVideo.childIds.length) {
    return
  }

  // Check if any child videos still have PUBLISHED variants in this language and get the parent variant
  const [publishedChildVariantsCount, parentVariant] = await Promise.all([
    prisma.videoVariant.count({
      where: {
        videoId: { in: parentVideo.childIds },
        languageId: languageId,
        published: true,
        video: {
          published: true
        }
      }
    }),
    prisma.videoVariant.findFirst({
      where: {
        videoId: parentVideoId,
        languageId: languageId,
        // Only remove truly empty variants (no video content)
        AND: [{ hls: '' }, { muxVideoId: null }]
      }
    })
  ])

  // If no published child variants exist in this language and we have an empty parent variant, remove it
  if (publishedChildVariantsCount === 0 && parentVariant) {
    // Delete the empty parent variant and update available languages in a single transaction
    const updatedLanguages = parentVideo.availableLanguages.filter(
      (lang) => lang !== languageId
    )

    await prisma.$transaction(async (tx) => {
      await tx.videoVariant.delete({
        where: { id: parentVariant.id }
      })

      await tx.video.update({
        where: { id: parentVideoId },
        data: { availableLanguages: updatedLanguages }
      })
    })
  }
}

builder.prismaObject('VideoVariant', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    asset: t
      .withAuth({ isPublisher: true })
      .relation('asset', { nullable: true, description: 'master video file' }),
    videoId: t.exposeID('videoId'),
    hls: t.exposeString('hls'),
    dash: t.exposeString('dash'),
    share: t.exposeString('share'),
    downloadable: t.exposeBoolean('downloadable', { nullable: false }),
    downloads: t.prismaField({
      type: ['VideoVariantDownload'],
      nullable: false,
      resolve: async (query, parent, _args, context) => {
        // If clientName matches a platform in restrictDownloadPlatforms, return empty array
        if (context.clientName && parent.videoId) {
          const video = await prisma.video.findUnique({
            where: { id: parent.videoId },
            select: { restrictDownloadPlatforms: true }
          })

          if (
            video?.restrictDownloadPlatforms.includes(
              context.clientName as Platform
            )
          ) {
            return []
          }
        }

        // Otherwise, return the downloads
        return await prisma.videoVariantDownload.findMany({
          ...query,
          where: { videoVariantId: parent.id }
        })
      }
    }),
    duration: t.int({
      nullable: false,
      resolve: ({ duration }) => duration ?? 0
    }),
    lengthInMilliseconds: t.int({
      nullable: false,
      resolve: ({ lengthInMilliseconds }) => lengthInMilliseconds ?? 0
    }),
    language: t.field({
      type: Language,
      nullable: false,
      resolve: ({ languageId: id }) => ({ id })
    }),
    muxVideo: t.relation('muxVideo', { nullable: true }),
    published: t.exposeBoolean('published', { nullable: false }),
    videoEdition: t.relation('videoEdition', { nullable: false }),
    subtitle: t.prismaField({
      type: ['VideoSubtitle'],
      nullable: false,
      args: {
        languageId: t.arg.id({ required: false }),
        primary: t.arg.boolean({ required: false })
      },
      resolve: async (query, parent, { languageId, primary }) => {
        if (parent.videoId == null) return []
        return await prisma.videoSubtitle.findMany({
          ...query,
          where: {
            AND: [
              { videoId: parent.videoId, edition: parent.edition },
              {
                OR: compact([
                  primary != null ? { primary } : undefined,
                  languageId != null ? { languageId } : undefined
                ])
              }
            ]
          },
          orderBy: { primary: 'desc' }
        })
      }
    }),
    subtitleCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        if (parent.videoId == null) return 0
        return await prisma.videoSubtitle.count({
          where: { videoId: parent.videoId, edition: parent.edition }
        })
      }
    }),
    slug: t.exposeString('slug', {
      nullable: false,
      description: 'slug is a permanent link to the video variant.'
    }),
    version: t.withAuth({ isPublisher: true }).exposeInt('version', {
      nullable: false,
      description: 'version control for master video file'
    })
  })
})

builder.queryFields((t) => ({
  videoVariant: t.prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      const videoVariant = await prisma.videoVariant.findUnique({
        ...query,
        where: { id }
      })
      if (videoVariant == null)
        throw new Error(`VideoVariant with id ${id} not found`)
      return videoVariant
    }
  }),
  videoVariants: t.prismaField({
    type: ['VideoVariant'],
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantFilter, required: false })
    },
    resolve: async (query, _parent, { input }) =>
      await prisma.videoVariant.findMany({
        ...query,

        where: {
          published: input?.onlyPublished === false ? undefined : true
        }
      })
  })
}))

builder.mutationFields((t) => ({
  videoVariantCreate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      const newVariant = await prisma.videoVariant.create({
        ...query,
        data: {
          ...input,
          muxVideoId: input.muxVideoId ?? undefined,
          published: input.published ?? true,
          version: input.version ?? undefined
        }
      })
      const video = await prisma.video.findUnique({
        where: { id: newVariant.videoId },
        select: { availableLanguages: true }
      })
      const currentLanguages = video?.availableLanguages || []
      const updatedLanguages = Array.from(
        new Set([...currentLanguages, newVariant.languageId])
      )
      await prisma.video.update({
        where: { id: newVariant.videoId },
        data: { availableLanguages: updatedLanguages }
      })

      // Handle parent variant creation for child videos
      try {
        await handleParentVariantCreation(
          newVariant.videoId,
          newVariant.languageId
        )
      } catch (error) {
        console.error('Parent variant creation error:', error)
      }

      // Save the videoId before the try/catch block
      const { id, videoId } = newVariant

      try {
        await updateVideoVariantInAlgolia(id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        void videoVariantCacheReset(id)
        void videoCacheReset(videoId)
      } catch (error) {
        // Log the error but don't throw it
        console.error('Cache reset error:', error)
      }
      return newVariant
    }
  }),
  videoVariantUpdate: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantUpdateInput, required: true })
    },
    resolve: async (query, _parent, { input }) => {
      // Get the current variant to check if published status is changing
      const currentVariant = await prisma.videoVariant.findUnique({
        where: { id: input.id },
        select: { published: true, videoId: true, languageId: true }
      })

      if (!currentVariant) {
        throw new Error(`VideoVariant with id ${input.id} not found`)
      }

      const updated = await prisma.videoVariant.update({
        ...query,
        where: { id: input.id },
        data: {
          hls: input.hls ?? undefined,
          dash: input.dash ?? undefined,
          share: input.share ?? undefined,
          duration: input.duration ?? undefined,
          lengthInMilliseconds: input.lengthInMilliseconds ?? undefined,
          languageId: input.languageId ?? undefined,
          slug: input.slug ?? undefined,
          videoId: input.videoId ?? undefined,
          edition: input.edition ?? undefined,
          downloadable: input.downloadable ?? undefined,
          published: input.published ?? undefined,
          muxVideoId: input.muxVideoId ?? undefined,
          assetId: input.assetId ?? undefined,
          version: input.version ?? undefined
        }
      })

      // Handle parent variant changes if published status changed
      const wasPublished = currentVariant.published
      const isNowPublished = input.published ?? currentVariant.published

      if (wasPublished !== isNowPublished) {
        try {
          if (isNowPublished) {
            // Variant was unpublished and is now published - create parent variants
            await handleParentVariantCreation(
              currentVariant.videoId,
              currentVariant.languageId
            )
          } else {
            // Variant was published and is now unpublished - cleanup parent variants
            await handleParentVariantCleanup(
              currentVariant.videoId,
              currentVariant.languageId
            )
          }
        } catch (error) {
          console.error('Parent variant update error:', error)
        }
      }

      // Store the videoId before the try/catch block
      const videoId = input.videoId ?? updated.videoId

      try {
        await updateVideoVariantInAlgolia(updated.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        void videoVariantCacheReset(updated.id)
        // Reset the video cache if we have a videoId
        if (videoId) {
          void videoCacheReset(videoId)
        }
      } catch (error) {
        // Log the error but don't throw it
        console.error('Cache reset error:', error)
      }
      return updated
    }
  }),
  videoVariantDelete: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariant',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) => {
      // Get the video variant with all associated assets
      const variant = await prisma.videoVariant.findUnique({
        where: { id },
        include: {
          downloads: {
            include: {
              asset: true
            }
          },
          asset: true,
          muxVideo: true
        }
      })

      if (variant == null) {
        throw new Error(`VideoVariant with id ${id} not found`)
      }

      // Store videoId and languageId to use later
      const { videoId, languageId } = variant

      // Clean up R2 assets
      const assetsToDelete: string[] = []

      // Add main variant asset if it exists
      if (variant.assetId != null) {
        assetsToDelete.push(variant.assetId)
      }

      // Add download assets if they exist
      if (variant.downloads) {
        variant.downloads.forEach((download) => {
          if (download.assetId != null) {
            assetsToDelete.push(download.assetId)
          }
        })
      }

      // Delete R2 assets
      for (const assetId of assetsToDelete) {
        try {
          // Get the R2 asset record to get the fileName
          const r2Asset = await prisma.cloudflareR2.findUnique({
            where: { id: assetId },
            select: { fileName: true }
          })

          if (r2Asset?.fileName != null) {
            // Delete the actual file from Cloudflare R2 storage
            await deleteR2File(r2Asset.fileName)
          }

          // Delete the database record
          await prisma.cloudflareR2.delete({
            where: { id: assetId }
          })
        } catch (error) {
          // Log error but continue with other deletions
          console.error(`Failed to delete R2 asset ${assetId}:`, error)
        }
      }

      // Clean up Mux asset
      if (variant.muxVideoId != null && variant.muxVideo != null) {
        try {
          // Delete from Mux service first (using assetId, not our database ID)
          if (variant.muxVideo.assetId != null) {
            await deleteVideo(variant.muxVideo.assetId, false)
          }

          // Delete from our database
          await prisma.muxVideo.delete({
            where: { id: variant.muxVideoId }
          })
        } catch (error) {
          // Log error but continue with variant deletion
          console.error(
            `Failed to delete Mux video ${variant.muxVideoId}:`,
            error
          )
        }
      }

      // Delete the video variant
      const deleted = await prisma.videoVariant.delete({
        ...query,
        where: { id }
      })

      // Handle parent variant cleanup for child videos
      try {
        await handleParentVariantCleanup(videoId, languageId)
      } catch (error) {
        console.error('Parent variant cleanup error:', error)
      }

      try {
        await updateVideoVariantInAlgolia(id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }
      try {
        void videoVariantCacheReset(id)
        void videoCacheReset(videoId)
      } catch (error) {
        // Log the error but don't throw it
        console.error('Cache reset error:', error)
      }
      return deleted
    }
  })
}))
