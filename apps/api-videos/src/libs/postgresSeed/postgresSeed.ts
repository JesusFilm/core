import { create } from 'jsondiffpatch'
import isArray from 'lodash/isArray'
import omit from 'lodash/omit'
import sortBy from 'lodash/sortBy'
import toNumber from 'lodash/toNumber'

import {
  Prisma,
  PrismaClient,
  Video,
  VideoTitle,
  VideoVariant,
  VideoVariantDownload,
  VideoVariantSubtitle
} from '.prisma/api-videos-client'

import {
  getArclightMediaComponent,
  getArclightMediaComponentLanguages,
  getArclightMediaComponentLinks,
  transformArclightMediaComponentToVideo
} from '../arclight/arclight'

type PrismaVideo = Omit<Video, 'childIds'> & {
  title: VideoTitle[]
  variants: Array<
    VideoVariant & {
      subtitle: VideoVariantSubtitle[]
      downloads: VideoVariantDownload[]
    }
  >
  childIds: string[]
}

export type ExportedVideo = Omit<
  Prisma.VideoUncheckedCreateInput,
  'variants' | 'title' | 'childIds'
> & {
  title: Prisma.VideoTitleUncheckedCreateInput[]
  variants: Array<
    Omit<Prisma.VideoVariantUncheckedCreateInput, 'downloads' | 'subtitle'> & {
      downloads?: Prisma.VideoVariantDownloadUncheckedCreateInput[]
      subtitle?: Prisma.VideoVariantSubtitleUncheckedCreateInput[]
    }
  >
  childIds: string[]
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

export async function handleVideo(
  video: Omit<
    Prisma.VideoUncheckedCreateInput,
    'variants' | 'title' | 'childIds'
  > & {
    title: Prisma.VideoTitleUncheckedCreateInput[]
    variants: Array<
      Omit<
        Prisma.VideoVariantUncheckedCreateInput,
        'downloads' | 'subtitle'
      > & {
        downloads?: Prisma.VideoVariantDownloadUncheckedCreateInput[]
        subtitle?: Prisma.VideoVariantSubtitleUncheckedCreateInput[]
      }
    >
    childIds: string[]
  },
  languages,
  usedVideoSlugs,
  importedVideos: string[],
  mode: string
): Promise<void> {
  if (video.id == null) return

  console.log('processing video:', video.id)

  let existingVideo: PrismaVideo | ExportedVideo | null

  if (!importedVideos.includes(video.id)) {
    video.title = sortBy(video.title, ['languageId'])
    video.variants = sortBy(video.variants, ['id']).map((variant) => ({
      ...variant,
      subtitle: sortBy(variant.subtitle, ['languageId']),
      downloads: sortBy(variant.downloads, ['url'])
    }))

    existingVideo = await prisma.video.findUnique({
      where: { id: video.id },
      include: {
        title: {},
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

    if (existingVideo != null && mode === 'complete') {
      existingVideo = {
        ...existingVideo,
        title: existingVideo.title.map((title) => omit(title, 'id')),
        variants: sortBy(existingVideo.variants, ['id']).map((variant) => ({
          ...variant,
          subtitle: variant.subtitle?.map((subtitle) => omit(subtitle, 'id')),
          downloads: variant.downloads?.map((download) => omit(download, 'id'))
        }))
      } as unknown as ExportedVideo
    }
    if (mode === 'complete' || existingVideo == null) {
      const delta = jsondiffpatch.diff(existingVideo ?? {}, video) ?? {}
      if (Object.keys(delta).length > 0) {
        await prisma.$transaction(
          async (tx) => {
            if (video.id == null) return
            const videoFields = [
              'id',
              'label',
              'primaryLanguageId',
              'seoTitle',
              'snippet',
              'description',
              'studyQuestions',
              'image',
              'imageAlt',
              'slug',
              'noIndex'
            ]
            const hasChanges = Object.keys(delta).some((key) =>
              videoFields.includes(key)
            )
            if (existingVideo == null || hasChanges) {
              await tx.video.upsert({
                where: { id: video.id },
                create: omit(video, ['variants', 'title']),
                update: {
                  ...omit(video, ['variants', 'title'])
                }
              })
            }

            if (delta.title != null) {
              // key is languageId
              for (const key in delta.title) {
                // ignore _t on index 0
                if (key === '_t') continue

                const title = delta.title[key]

                // ignore moved items
                if (isMovedItem(title)) continue

                const languageId = key.startsWith('_')
                  ? existingVideo?.title[toNumber(key)].languageId
                  : video.title[toNumber(key)].languageId

                if (isArray(title) && title.length === 1) {
                  // handle create
                  await tx.videoTitle.create({
                    data: title[0]
                  })
                } else if (isArray(title) && title[2] === 0) {
                  // handle delete
                  await tx.videoTitle.delete({
                    where: {
                      videoId_languageId: {
                        videoId: video.id,
                        languageId: title[0].languageId
                      }
                    }
                  })
                } else if (
                  Object.keys(title).length > 0 &&
                  languageId != null
                ) {
                  // handle update
                  await tx.videoTitle.update({
                    where: {
                      videoId_languageId: {
                        videoId: video.id,
                        languageId
                      }
                    },
                    data: getChangedValues<Prisma.VideoTitleUncheckedUpdateInput>(
                      title
                    )
                  })
                }
              }
            }

            if (delta.variants != null) {
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

                  const id = key.startsWith('_')
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
                        id
                      }
                    })
                  } else if (Object.keys(variant).length > 0 && id != null) {
                    // handle update
                    const changedValues: Prisma.VideoVariantUncheckedUpdateInput =
                      getChangedValues<Prisma.VideoVariantUncheckedUpdateInput>(
                        variant
                      )

                    if (
                      Object.keys(
                        omit(changedValues, ['subtitle', 'downloads'])
                      ).length > 0
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

                        const languageId = sKey.startsWith('_')
                          ? existingVideo?.variants[toNumber(key)]?.subtitle?.[
                              toNumber(sKey)
                            ].languageId
                          : video.variants[toNumber(key)]?.subtitle?.[
                              toNumber(sKey)
                            ]?.languageId

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
                        } else if (
                          Object.keys(subtitle).length > 0 &&
                          languageId != null
                        ) {
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
                          : video.variants[toNumber(key)]?.downloads?.[
                              toNumber(dKey)
                            ]?.quality

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
                        } else if (
                          Object.keys(download).length > 0 &&
                          quality != null
                        ) {
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
          },
          {
            timeout: 6000000
          }
        )
      } else {
        console.log('no changes')
      }
    }
    importedVideos.push(video.id)
  } else {
    console.log('already imported')
  }

  for (let i = 0; i < video.childIds.length; i++) {
    const childId = video.childIds[i]
    if (childId != null && !importedVideos.includes(childId)) {
      const mediaComponent = await getArclightMediaComponent(childId)

      if (mediaComponent == null) continue
      console.log(
        `fetching child mediaComponent:`,
        mediaComponent.mediaComponentId
      )
      const mediaComponentLanguages = await getArclightMediaComponentLanguages(
        mediaComponent.mediaComponentId
      )
      const mediaComponentLinks = await getArclightMediaComponentLinks(
        mediaComponent.mediaComponentId
      )

      const child = transformArclightMediaComponentToVideo(
        mediaComponent,
        mediaComponentLanguages,
        mediaComponentLinks,
        languages,
        usedVideoSlugs
      )

      await handleVideo(child, languages, usedVideoSlugs, importedVideos, mode)
    }
    await prisma.video.update({
      where: { id: childId },
      data: { parent: { connect: { id: video.id } } }
    })
  }
}
