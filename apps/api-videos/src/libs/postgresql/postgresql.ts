import { Delta, create } from 'jsondiffpatch'
import isArray from 'lodash/isArray'
import omit from 'lodash/omit'
import sortBy from 'lodash/sortBy'
import toNumber from 'lodash/toNumber'

import {
  Prisma,
  PrismaClient,
  Video,
  VideoDescription,
  VideoSnippet,
  VideoTitle,
  VideoVariant,
  VideoVariantDownload,
  VideoVariantSubtitle
} from '.prisma/api-videos-client'

export type PrismaVideo = Omit<Video, 'childIds'> & {
  title: VideoTitle[]
  newDescription: VideoDescription[]
  newSnippet: VideoSnippet[]
  variants: Array<
    VideoVariant & {
      subtitle: VideoVariantSubtitle[]
      downloads: VideoVariantDownload[]
    }
  >
}

export type PrismaVideoCreateInput = Omit<
  Prisma.VideoUncheckedCreateInput,
  'variants' | 'title' | 'childIds' | 'id' | 'newDescription' | 'newSnippet'
> & {
  id: string
  title: Prisma.VideoTitleUncheckedCreateInput[]
  newDescription: Prisma.VideoDescriptionUncheckedCreateInput[]
  newSnippet: Prisma.VideoSnippetUncheckedCreateInput[]
  variants: Array<
    Omit<Prisma.VideoVariantUncheckedCreateInput, 'downloads' | 'subtitle'> & {
      downloads?: Prisma.VideoVariantDownloadUncheckedCreateInput[]
      subtitle?: Prisma.VideoVariantSubtitleUncheckedCreateInput[]
    }
  >
}

const prisma = new PrismaClient()

const jsondiffpatch = create({
  arrays: {
    detectMove: true
  },
  objectHash: (obj, index) => {
    return obj.id ?? obj.languageId ?? `$$index:${index as string}`
  },
  textDiff: {
    minLength: 4096
  }
})

function getChangedValues<T>(obj): T {
  const changedValues = {}
  for (const key in obj) {
    const value = obj[key]
    if (isArray(value)) {
      changedValues[key] = value.pop()
    }
  }
  return changedValues as unknown as T
}

function isMovedItem(item): boolean {
  return isArray(item) && item[0] === '' && item[2] !== 0
}

async function handlePrismaVideo(
  video: PrismaVideoCreateInput,
  existingVideo,
  tx,
  delta
): Promise<void> {
  const videoFields = [
    'id',
    'label',
    'primaryLanguageId',
    'snippet',
    'description',
    'studyQuestions',
    'image',
    'imageAlt',
    'slug',
    'noIndex'
  ]
  const hasChanges = Object.keys(delta).some((key) => videoFields.includes(key))
  if (existingVideo == null || hasChanges) {
    await tx.video.upsert({
      where: { id: video.id },
      create: omit(video, [
        'variants',
        'title',
        'newDescription',
        'newSnippet'
      ]),
      update: {
        ...omit(video, ['variants', 'title', 'newDescription', 'newSnippet'])
      }
    })
  }
  if (delta.title != null) {
    await handlePrismaTranslationTables<Prisma.VideoTitleUncheckedUpdateInput>(
      'title',
      'videoTitle',
      video,
      existingVideo,
      tx,
      delta
    )
  }
  if (delta.newDescription != null) {
    await handlePrismaTranslationTables<Prisma.VideoDescriptionUncheckedUpdateInput>(
      'newDescription',
      'videoDescription',
      video,
      existingVideo,
      tx,
      delta
    )
  }
  if (delta.newSnippet != null) {
    await handlePrismaTranslationTables<Prisma.VideoSnippetUncheckedUpdateInput>(
      'newSnippet',
      'videoSnippet',
      video,
      existingVideo,
      tx,
      delta
    )
  }
}

async function handlePrismaTranslationTables<T>(
  field: string,
  prismaField: string,
  video: PrismaVideoCreateInput,
  existingVideo: PrismaVideoCreateInput,
  tx: Prisma.TransactionClient,
  delta: Delta
): Promise<void> {
  // key is languageId
  for (const key in delta[field]) {
    // ignore _t on index 0
    if (key === '_t') continue

    const fieldDelta = delta[field][key]

    // ignore moved items
    if (isMovedItem(fieldDelta)) continue

    const languageId = key.startsWith('_')
      ? existingVideo?.[field][toNumber(key)].languageId
      : video[field][toNumber(key)].languageId

    if (isArray(fieldDelta) && fieldDelta.length === 1) {
      // handle create
      await tx[prismaField].create({
        data: fieldDelta[0]
      })
    } else if (isArray(fieldDelta) && fieldDelta[2] === 0) {
      // handle delete
      await tx[prismaField].delete({
        where: {
          videoId_languageId: {
            videoId: video.id,
            languageId: fieldDelta[0].languageId
          }
        }
      })
    } else if (Object.keys(fieldDelta).length > 0 && languageId != null) {
      // handle update
      await tx[prismaField].update({
        where: {
          videoId_languageId: {
            videoId: video.id,
            languageId
          }
        },
        data: getChangedValues<T>(fieldDelta)
      })
    }
  }
}

async function handlePrismaVideoVariants(
  video: PrismaVideoCreateInput,
  existingVideo: PrismaVideoCreateInput | null,
  tx: Prisma.TransactionClient,
  delta: Delta
): Promise<void> {
  // handle new video
  if (isArray(delta.variants)) {
    await tx.videoVariant.createMany({
      data: delta.variants[0].map((variant) =>
        omit(variant, ['subtitle', 'downloads'])
      )
    })
    for (const variant of delta.variants[0]) {
      if (variant.subtitle != null)
        await tx.videoVariantSubtitle.createMany({
          data: variant.subtitle
        })
      if (variant.downloads != null)
        await tx.videoVariantDownload.createMany({
          data: variant.downloads
        })
    }
  } else {
    for (const key in delta.variants) {
      // ignore _t on index 0
      if (key === '_t') continue

      const variant = delta.variants[key]

      // ignore moved items
      if (isMovedItem(variant)) continue

      const id =
        key.startsWith('_') && existingVideo?.variants[toNumber(key)] != null
          ? existingVideo?.variants[toNumber(key)].id
          : video.variants[toNumber(key)]?.id

      if (isArray(variant) && variant.length === 1) {
        // handle create
        await tx.videoVariant.create({
          data: {
            ...(omit(variant[0], [
              'subtitle',
              'downloads'
            ]) as unknown as Prisma.VideoVariantUncheckedCreateInput)
          }
        })
        if (variant[0].subtitle != null)
          await tx.videoVariantSubtitle.createMany({
            data: variant[0].subtitle
          })
        if (variant[0].downloads != null)
          await tx.videoVariantDownload.createMany({
            data: variant[0].downloads.map((dl) => ({
              ...dl,
              videoVariantId: variant[0].id
            }))
          })
      } else if (isArray(variant) && variant[2] === 0) {
        // handle delete
        await tx.videoVariant.delete({
          where: {
            id: variant[0].id
          }
        })
      } else if (Object.keys(variant).length > 0 && id != null) {
        // handle update
        const changedValues: Prisma.VideoVariantUncheckedUpdateInput =
          getChangedValues<Prisma.VideoVariantUncheckedUpdateInput>(variant)

        if (
          Object.keys(omit(changedValues, ['subtitle', 'downloads'])).length > 0
        ) {
          await tx.videoVariant.update({
            where: {
              id
            },
            data: omit(changedValues, ['subtitle', 'downloads'])
          })
        }

        if (
          variant.subtitle != null &&
          Object.keys(variant.subtitle).length > 0
        ) {
          for (const sKey in variant.subtitle) {
            if (sKey === '_t') continue

            const subtitle = variant.subtitle[sKey]
            // ignore moved items
            if (isMovedItem(subtitle)) continue

            const languageId =
              sKey.startsWith('_') &&
              existingVideo?.variants[toNumber(key)]?.subtitle?.[
                toNumber(sKey)
              ] != null
                ? existingVideo?.variants[toNumber(key)]?.subtitle?.[
                    toNumber(sKey)
                  ].languageId
                : video.variants[toNumber(key)]?.subtitle?.[toNumber(sKey)]
                    ?.languageId

            if (isArray(subtitle) && subtitle.length === 1) {
              // handle create
              await tx.videoVariantSubtitle.create({
                data: subtitle[0]
              })
            } else if (
              isArray(subtitle) &&
              subtitle[2] === 0 &&
              languageId != null
            ) {
              // handle delete
              await tx.videoVariantSubtitle.delete({
                where: {
                  videoVariantId_languageId: {
                    videoVariantId: id,
                    languageId
                  }
                }
              })
            } else if (Object.keys(subtitle).length > 0 && languageId != null) {
              // handle update
              await tx.videoVariantSubtitle.update({
                where: {
                  videoVariantId_languageId: {
                    videoVariantId: id,
                    languageId
                  }
                },
                data: getChangedValues<Prisma.VideoVariantUncheckedUpdateInput>(
                  subtitle
                )
              })
            }
          }
        }

        if (
          variant.downloads != null &&
          Object.keys(variant.downloads).length > 0
        ) {
          for (const dKey in variant.downloads) {
            if (dKey === '_t') continue

            const download = variant.downloads[dKey]

            // ignore moved items
            if (isMovedItem(download)) continue

            const quality = dKey.startsWith('_')
              ? existingVideo?.variants[toNumber(key)]?.downloads?.[
                  toNumber(dKey)
                ].quality
              : video.variants[toNumber(key)]?.downloads?.[toNumber(dKey)]
                  ?.quality

            if (isArray(download) && download.length === 1) {
              // handle create
              await tx.videoVariantDownload.create({
                data: download[0]
              })
            } else if (
              isArray(download) &&
              download[2] === 0 &&
              quality != null
            ) {
              // handle delete
              await tx.videoVariantDownload.delete({
                where: {
                  quality_videoVariantId: {
                    quality,
                    videoVariantId: id
                  }
                }
              })
            } else if (Object.keys(download).length > 0 && quality != null) {
              // handle update
              await tx.videoVariantDownload.update({
                where: {
                  quality_videoVariantId: {
                    quality,
                    videoVariantId: id
                  }
                },
                data: getChangedValues<Prisma.VideoVariantDownloadUncheckedUpdateInput>(
                  download[0]
                )
              })
            }
          }
        }
      }
    }
  }
}

async function getExistingVideo(video): Promise<PrismaVideoCreateInput | null> {
  let existingVideo: PrismaVideo | PrismaVideoCreateInput | null =
    await prisma.video.findUnique({
      where: { id: video.id },
      include: {
        title: true,
        newDescription: true,
        newSnippet: true,
        variants: {
          include: {
            subtitle: {
              orderBy: { languageId: 'asc' }
            },
            downloads: {
              orderBy: { url: 'asc' }
            }
          }
        }
      }
    })

  if (existingVideo != null) {
    existingVideo = {
      ...existingVideo,
      title: existingVideo.title.map((title) => omit(title, 'id')),
      newDescription: existingVideo.newDescription.map((description) =>
        omit(description, 'id')
      ),
      newSnippet: existingVideo.newSnippet.map((snippet) =>
        omit(snippet, 'id')
      ),
      variants: sortBy(existingVideo.variants, ['id']).map((variant) => ({
        ...variant,
        subtitle: variant.subtitle?.map((subtitle) => omit(subtitle, 'id')),
        downloads: variant.downloads?.map((download) => omit(download, 'id'))
      }))
    } as unknown as PrismaVideoCreateInput
  }

  return existingVideo
}

export async function handleVideo(
  video: PrismaVideoCreateInput,
  importedVideos: string[]
): Promise<void> {
  if (video.id == null) return

  console.log('processing video:', video.id)

  video.title = sortBy(video.title, ['languageId'])
  video.newDescription = sortBy(video.newDescription, ['languageId'])
  video.newSnippet = sortBy(video.newSnippet, ['languageId'])
  video.variants = sortBy(video.variants, ['id']).map((variant) => ({
    ...variant,
    subtitle: sortBy(variant.subtitle, ['languageId']),
    downloads: sortBy(variant.downloads, ['url'])
  }))

  const existingVideo = await getExistingVideo(video)

  const delta = jsondiffpatch.diff(existingVideo ?? {}, video) ?? {}
  if (Object.keys(delta).length > 0) {
    await prisma.$transaction(
      async (tx) => {
        if (video.id == null) return
        await handlePrismaVideo(video, existingVideo, tx, delta)

        if (delta.variants != null) {
          await handlePrismaVideoVariants(video, existingVideo, tx, delta)
        }
      },
      {
        timeout: 6000000
      }
    )
  } else {
    console.log('no changes')
  }
  importedVideos.push(video.id)
}

export async function getVideoIdsAndSlugs(): Promise<{
  slugs: Record<string, string>
  ids: string[]
}> {
  const results = await prisma.video.findMany({
    select: { slug: true, id: true }
  })

  const slugs: Record<string, string> = {}
  const ids: string[] = []
  for await (const video of results) {
    ids.push(video.id)
    if (video.slug != null) slugs[video.slug] = video.id
  }

  return { slugs, ids }
}

export async function updateParentChild(
  parentId: string,
  childId: string
): Promise<void> {
  await prisma.video.update({
    where: { id: childId },
    data: { parent: { connect: { id: parentId } } }
  })
}

export async function updateChildIds(
  id: string,
  childIds: string[]
): Promise<void> {
  await prisma.video.update({
    where: { id },
    data: { childIds }
  })
}
