// version 2
// increment to trigger re-seed (ie: files other than seed.ts are changed)

import {
  PrismaClient,
  Prisma,
  Video,
  VideoTitle,
  VideoVariant,
  VideoVariantSubtitle,
  VideoVariantDownload
} from '.prisma/api-videos-client'
import omit from 'lodash/omit'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'
import { fetchMediaComponentsAndTransformToVideos } from '../src/libs/arclight'
import { fetchMediaLanguagesAndTransformToLanguages } from '../src/libs/arclight/arclight'

const prisma = new PrismaClient()

async function getVideoSlugs(): Promise<Record<string, string>> {
  const results = await prisma.video.findMany({
    select: { slug: true, id: true }
  })

  const slugs: Record<string, string> = {}
  for await (const video of results) {
    if (video.slug != null) slugs[video.slug] = video.id
  }
  return slugs
}

type ExportedVideo = Omit<
  Prisma.VideoUncheckedCreateInput,
  'variants' | 'title'
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

type PrismaVideo = Video & {
  children: Array<{ id: string }>
  title: VideoTitle[]
  variants: Array<
    VideoVariant & {
      subtitle: VideoVariantSubtitle[]
      downloads: VideoVariantDownload[]
    }
  >
}

async function importMediaComponents(): Promise<void> {
  const usedVideoSlugs: Record<string, string> = await getVideoSlugs()
  const languages = await fetchMediaLanguagesAndTransformToLanguages()
  let videos: ExportedVideo[]

  let page = 1
  const startTime = new Date().getTime()
  const videoChildIds: Record<string, string[]> = {}
  do {
    videos = await fetchMediaComponentsAndTransformToVideos(
      languages,
      usedVideoSlugs,
      page
    )
    for (const video of videos) {
      video.title = sortBy(video.title, ['languageId'])
      video.variants = sortBy(video.variants, ['id']).map((variant) => ({
        ...variant,
        subtitle: sortBy(variant.subtitle, ['languageId']),
        downloads: sortBy(variant.downloads, ['url'])
      }))

      console.log('processing video:', video.id)

      let existingVideo: PrismaVideo | ExportedVideo | null =
        await prisma.video.findUnique({
          where: { id: video.id },
          include: {
            title: { orderBy: { languageId: 'asc' } },
            children: {
              select: {
                id: true
              },
              orderBy: { sortOrder: 'asc' }
            },
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
          ...omit(existingVideo, ['children', 'sortOrder']),
          title: existingVideo.title.map((title) =>
            omit(title, ['id', 'videoId'])
          ),
          variants: sortBy(existingVideo.variants, ['id']).map((variant) => ({
            ...omit(variant, 'videoId'),
            subtitle: variant.subtitle.map((subtitle) =>
              omit(subtitle, ['id'])
            ),
            downloads: variant.downloads.map((download) =>
              omit(download, ['id', 'videoVariantId'])
            )
          })),
          childIds: existingVideo?.children.map(({ id }) => id)
        } as unknown as ExportedVideo
        if (isEqual(existingVideo, video)) {
          console.log('no changes')
          continue
        }
      }

      await prisma.$transaction(
        async (tx) => {
          if (video.id == null) return
          if (
            !isEqual(
              omit(video, ['title', 'variants', 'childIds']),
              omit(existingVideo, ['title', 'variants', 'childIds'])
            )
          ) {
            await tx.video.upsert({
              where: { id: video.id },
              create: omit(video, ['childIds', 'variants', 'title']),
              update: {
                ...omit(video, ['childIds', 'variants', 'title'])
              }
            })
          }

          if (!isEqual(video.title, existingVideo?.title)) {
            // clean up any dead languages
            await tx.videoTitle.deleteMany({
              where: {
                videoId: video.id,
                languageId: {
                  notIn: video.title.map((title) => title.languageId)
                }
              }
            })

            for (let index = 0; index < video.title.length; index++) {
              const title = video.title[index]
              await tx.videoTitle.upsert({
                where: {
                  videoId_languageId: {
                    videoId: video.id,
                    languageId: title.languageId
                  }
                },
                update: {
                  value: title.value,
                  primary: title.primary
                },
                create: {
                  videoId: video.id,
                  ...title
                }
              })
            }
          }

          if (!isEqual(video.variants, existingVideo?.variants)) {
            // clean up dead variants
            await tx.videoVariant.deleteMany({
              where: {
                videoId: video.id,
                id: { notIn: video.variants.map(({ id }) => id) }
              }
            })

            console.log('processing video variants')
            for (let index = 0; index < video.variants.length; index++) {
              const variant = video.variants[index]
              await tx.videoVariant.upsert({
                where: { id: variant.id },
                update: omit(variant, ['downloads', 'subtitle']),
                create: {
                  ...omit(variant, ['downloads', 'subtitle']),
                  videoId: video.id
                }
              })

              if (variant.downloads != null) {
                // clean up dead downloads
                await tx.videoVariantDownload.deleteMany({
                  where: {
                    videoVariantId: variant.id,
                    quality: {
                      notIn: variant.downloads.map(({ quality }) => quality)
                    }
                  }
                })

                for (let i = 0; i < (variant.downloads ?? []).length; i++) {
                  const download = variant.downloads[i]
                  await tx.videoVariantDownload.upsert({
                    where: {
                      quality_videoVariantId: {
                        quality: download.quality,
                        videoVariantId: variant.id
                      }
                    },
                    create: {
                      videoVariantId: variant.id,
                      ...download
                    },
                    update: download
                  })
                }
              }

              if (variant.subtitle != null) {
                // clean up dead subtitles
                await tx.videoVariantSubtitle.deleteMany({
                  where: {
                    videoVariantId: variant.id,
                    languageId: {
                      notIn: variant.subtitle.map(
                        ({ languageId }) => languageId
                      )
                    }
                  }
                })

                for (let i = 0; i < (variant.subtitle ?? []).length; i++) {
                  const subtitle = variant.subtitle[i]
                  await tx.videoVariantSubtitle.upsert({
                    where: {
                      videoVariantId_languageId: {
                        languageId: subtitle.languageId,
                        videoVariantId: variant.id
                      }
                    },
                    create: {
                      ...subtitle,
                      videoVariantId: variant.id
                    },
                    update: subtitle
                  })
                }
              }
            }
          }
          videoChildIds[video.id] = video.childIds
        },
        {
          timeout: 6000000
        }
      )
    }
    const duration = new Date().getTime() - startTime
    console.log('importMediaComponents duration(s):', duration * 0.001)
    console.log('importMediaComponents page:', page)
    page++
  } while (videos.length > 0)
  // for (const [key, value] of Object.entries(videoChildIds)) {
  //   if (value.length === 0) continue
  //   await prisma.video.update({
  //     where: { id: key },
  //     data: {
  //       children: { connect: value.map((id) => ({ id })) }
  //     }
  //   })
  //   for (let index = 0; index < value.length; index++) {
  //     await prisma.video.update({
  //       where: { id: value[index] },
  //       data: { sortOrder: index }
  //     })
  //   }
  // }
}

async function main(): Promise<void> {
  console.log('importing mediaComponents as videos...')
  await importMediaComponents()
  console.log('mediaComponents imported')
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
