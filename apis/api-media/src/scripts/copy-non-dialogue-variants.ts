import {
  Prisma,
  VideoVariantDownloadQuality,
  prisma
} from '../../../../libs/prisma/media/src/client'
import {
  updateVideoInAlgolia
} from '../lib/algolia/algoliaVideoUpdate'
import {
  updateVideoVariantInAlgolia
} from '../lib/algolia/algoliaVideoVariantUpdate'
import { ensureLanguageHasVideosTrue } from '../lib/languages/ensureLanguageHasVideos'
import {
  videoCacheReset,
  videoVariantCacheReset
} from '../lib/videoCacheReset'
import {
  addLanguageToVideo,
  updateParentCollectionLanguages
} from '../schema/video/lib/updateAvailableLanguages'
import { handleParentVariantCreation } from '../schema/videoVariant/videoVariant'

// Copies the non-dialogue language coverage from a "virtual language" source
// video onto a target video that itself has no per-language audio.
//
// Each new VideoVariant on the target is a clone of one template variant on
// the target (default: the variant matching target.primaryLanguageId).
// VideoVariantDownload rows attached to the template are cloned alongside.
//
// Defaults map 2_0-1113 -> 2_TheLife. Override via env vars.

const SOURCE_VIDEO_ID = process.env.SOURCE_VIDEO_ID ?? '2_0-1113'
const TARGET_VIDEO_ID = process.env.TARGET_VIDEO_ID ?? '2_TheLife'
const APPLY = process.argv.includes('--apply')

type TemplateDownload = {
  quality: VideoVariantDownloadQuality
  size: number | null
  height: number | null
  width: number | null
  bitrate: number | null
  version: number
  url: string
  assetId: string | null
}

type TemplateVariant = {
  id: string
  languageId: string
  edition: string
  hls: string | null
  dash: string | null
  share: string | null
  downloadable: boolean
  duration: number | null
  lengthInMilliseconds: number | null
  masterUrl: string | null
  masterWidth: number | null
  masterHeight: number | null
  muxVideoId: string | null
  brightcoveId: string | null
  version: number
  published: boolean
  downloads: TemplateDownload[]
}

function extractLanguageSlug(variantSlug: string): string | null {
  const i = variantSlug.lastIndexOf('/')
  if (i === -1 || i === variantSlug.length - 1) return null
  const slug = variantSlug.substring(i + 1)
  return /^[a-z0-9_-]+$/i.test(slug) ? slug : null
}

async function main(): Promise<void> {
  console.log(`Source: ${SOURCE_VIDEO_ID}`)
  console.log(`Target: ${TARGET_VIDEO_ID}`)
  console.log(`Mode:   ${APPLY ? 'APPLY' : 'DRY RUN (pass --apply to write)'}\n`)

  const [target, source] = await Promise.all([
    prisma.video.findUnique({
      where: { id: TARGET_VIDEO_ID },
      select: {
        id: true,
        slug: true,
        primaryLanguageId: true,
        availableLanguages: true,
        variants: {
          select: {
            id: true,
            languageId: true,
            edition: true,
            hls: true,
            dash: true,
            share: true,
            downloadable: true,
            duration: true,
            lengthInMilliseconds: true,
            masterUrl: true,
            masterWidth: true,
            masterHeight: true,
            muxVideoId: true,
            brightcoveId: true,
            version: true,
            published: true,
            downloads: {
              select: {
                quality: true,
                size: true,
                height: true,
                width: true,
                bitrate: true,
                version: true,
                url: true,
                assetId: true
              }
            }
          }
        }
      }
    }),
    prisma.video.findUnique({
      where: { id: SOURCE_VIDEO_ID },
      select: {
        id: true,
        variants: {
          select: { languageId: true, slug: true }
        }
      }
    })
  ])

  if (target == null) throw new Error(`Target video ${TARGET_VIDEO_ID} not found`)
  if (target.slug == null) throw new Error(`Target video ${TARGET_VIDEO_ID} has no slug`)
  if (source == null) throw new Error(`Source video ${SOURCE_VIDEO_ID} not found`)

  const template: TemplateVariant | undefined =
    target.variants.find((v) => v.languageId === target.primaryLanguageId) ??
    target.variants[0]

  if (template == null) {
    throw new Error(
      `Target ${TARGET_VIDEO_ID} has no existing variants — need at least one variant to clone from`
    )
  }

  console.log(
    `Source variants: ${source.variants.length}\n` +
      `Target variants: ${target.variants.length} (availableLanguages: ${target.availableLanguages.length})\n` +
      `Template variant: ${template.id} lang=${template.languageId} edition='${template.edition}' downloads=${template.downloads.length}`
  )

  const existingLangIds = new Set(target.variants.map((v) => v.languageId))
  const candidates = source.variants.filter(
    (sv) => !existingLangIds.has(sv.languageId)
  )

  const malformed: string[] = []
  const toCopy: Array<{ languageId: string; languageSlug: string }> = []

  for (const sv of candidates) {
    const languageSlug = extractLanguageSlug(sv.slug)
    if (languageSlug == null) {
      malformed.push(`${sv.languageId} (slug='${sv.slug}')`)
      continue
    }
    toCopy.push({ languageId: sv.languageId, languageSlug })
  }

  if (malformed.length > 0) {
    console.warn(
      `\nSkipping ${malformed.length} source variants with unusable slugs:`
    )
    for (const m of malformed) console.warn(`  - ${m}`)
  }

  console.log(`\nLanguages to add to ${target.id}: ${toCopy.length}`)
  if (toCopy.length === 0) {
    console.log('Nothing to do.')
    return
  }

  if (!APPLY) {
    const VARIANT_PREVIEW = 2
    const DOWNLOAD_PREVIEW = 2
    const previewCount = Math.min(VARIANT_PREVIEW, toCopy.length)
    console.log(
      `\nPreview (full payload for first ${previewCount} of ${toCopy.length} variants, first ${DOWNLOAD_PREVIEW} of ${template.downloads.length} downloads each):`
    )
    for (const c of toCopy.slice(0, previewCount)) {
      const newVariantId = `${c.languageId}_${target.id}`
      const variantPayload = {
        id: newVariantId,
        videoId: target.id,
        languageId: c.languageId,
        edition: template.edition,
        slug: `${target.slug}/${c.languageSlug}`,
        hls: template.hls,
        dash: template.dash,
        share: template.share,
        downloadable: template.downloadable,
        duration: template.duration,
        lengthInMilliseconds: template.lengthInMilliseconds,
        masterUrl: template.masterUrl,
        masterWidth: template.masterWidth,
        masterHeight: template.masterHeight,
        muxVideoId: template.muxVideoId,
        brightcoveId: template.brightcoveId,
        version: template.version,
        published: template.published,
        assetId: null
      }
      const downloadPayloads = template.downloads
        .slice(0, DOWNLOAD_PREVIEW)
        .map((d) => ({
          quality: d.quality,
          size: d.size,
          height: d.height,
          width: d.width,
          bitrate: d.bitrate,
          version: d.version,
          url: d.url,
          assetId: d.assetId,
          videoVariantId: newVariantId
        }))

      console.log(`\n--- VideoVariant ${newVariantId} ---`)
      console.log(JSON.stringify(variantPayload, null, 2))
      console.log(
        `--- VideoVariantDownload sample (${downloadPayloads.length} of ${template.downloads.length}) ---`
      )
      console.log(JSON.stringify(downloadPayloads, null, 2))
    }
    if (toCopy.length > previewCount) {
      console.log(
        `\n... ${toCopy.length - previewCount} more language(s) would be created with the same shape (only languageId/slug/id change).`
      )
    }
    console.log('\nDry run complete. Re-run with --apply to write.')
    return
  }

  // Ensure VideoEdition row exists for template.edition on target (FK target)
  await prisma.videoEdition.upsert({
    where: { name_videoId: { name: template.edition, videoId: target.id } },
    create: { name: template.edition, videoId: target.id },
    update: {}
  })

  let createdVariants = 0
  let createdDownloads = 0

  for (const { languageId, languageSlug } of toCopy) {
    const newVariantId = `${languageId}_${target.id}`
    try {
      await prisma.$transaction(async (tx) => {
        await tx.videoVariant.create({
          data: {
            id: newVariantId,
            videoId: target.id,
            languageId,
            edition: template.edition,
            slug: `${target.slug as string}/${languageSlug}`,
            hls: template.hls,
            dash: template.dash,
            share: template.share,
            downloadable: template.downloadable,
            duration: template.duration,
            lengthInMilliseconds: template.lengthInMilliseconds,
            masterUrl: template.masterUrl,
            masterWidth: template.masterWidth,
            masterHeight: template.masterHeight,
            muxVideoId: template.muxVideoId,
            brightcoveId: template.brightcoveId,
            version: template.version,
            published: template.published
            // assetId intentionally null: VideoVariant.assetId is @unique
          }
        })

        if (template.downloads.length > 0) {
          await tx.videoVariantDownload.createMany({
            data: template.downloads.map((d) => ({
              quality: d.quality,
              size: d.size,
              height: d.height,
              width: d.width,
              bitrate: d.bitrate,
              version: d.version,
              url: d.url,
              assetId: d.assetId,
              videoVariantId: newVariantId
            }))
          })
        }
      })

      createdVariants++
      createdDownloads += template.downloads.length

      if (template.published) {
        await addLanguageToVideo(target.id, languageId)
      }

      try {
        await ensureLanguageHasVideosTrue(languageId)
      } catch (error) {
        console.error(`  language.hasVideos update failed for ${languageId}:`, error)
      }

      try {
        await handleParentVariantCreation(target.id, languageId)
      } catch (error) {
        console.error(
          `  Parent variant creation failed for ${target.id}/${languageId}:`,
          error
        )
      }

      try {
        await updateVideoVariantInAlgolia(newVariantId)
      } catch (error) {
        console.error(`  Algolia variant sync failed for ${newVariantId}:`, error)
      }

      try {
        await videoVariantCacheReset(newVariantId)
      } catch (error) {
        console.error(`  Variant cache reset failed for ${newVariantId}:`, error)
      }

      console.log(`  ✓ ${languageId} -> ${newVariantId}`)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        console.warn(
          `  ! ${languageId}: unique constraint hit (already exists?), skipping`
        )
        continue
      }
      throw error
    }
  }

  // Final video-level sync: availableLanguages on target + parent collections, Algolia
  try {
    await updateParentCollectionLanguages(target.id)
  } catch (error) {
    console.error('Parent collection language refresh failed:', error)
  }

  try {
    await updateVideoInAlgolia(target.id)
  } catch (error) {
    console.error('Algolia video sync failed:', error)
  }

  try {
    await videoCacheReset(target.id)
  } catch (error) {
    console.error('Video cache reset failed:', error)
  }

  console.log(
    `\nDone. Created ${createdVariants} variants and ${createdDownloads} downloads on ${target.id}.`
  )
}

async function run(): Promise<void> {
  try {
    await main()
  } catch (error) {
    console.error('Script failed:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void run()
