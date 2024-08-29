import OtaClient from '@crowdin/ota-client'
import chunk from 'lodash/chunk'
import map from 'lodash/map'
import uniqBy from 'lodash/uniqBy'
import { Logger } from 'pino'
import { xliff12ToJs } from 'xliff'
import z from 'zod'

import { Prisma } from '.prisma/api-videos-client'

import { prisma } from '../../../lib/prisma'

type CrowdinFileName =
  | '/Arclight/collection_title.csv'
  | '/Arclight/collection_long_description.csv'
  | '/Arclight/media_metadata_tile.csv'
  | '/Arclight/media_metadata_description.csv'
  | '/Arclight/study_questions.csv'
  | '/Arclight/Bible_books.csv'
  | string

const schema = z.object({
  resources: z.record(
    z.string(),
    z.record(
      z.string(),
      z.object({
        source: z.string(),
        target: z.string(),
        additionalAttributes: z
          .object({
            resname: z.string().optional(),
            translate: z.string().optional()
          })
          .optional()
      })
    )
  )
})

type CrowdinData = z.infer<typeof schema>

export async function pullTranslations(logger?: Logger): Promise<void> {
  console.time()
  logger?.info('crowdin import started')
  if (process.env.CROWDIN_DISTRIBUTION_HASH == null)
    throw new Error('crowdin distribution hash not set')

  const client = new OtaClient(process.env.CROWDIN_DISTRIBUTION_HASH, {
    disableManifestCache: true,
    disableStringsCache: true
  })

  const languages = await client.getTranslations()

  const languagesChunk = chunk(map(languages), 2)

  for (const chunk of languagesChunk) {
    await Promise.all(
      chunk.map(async (language) => {
        const languageId = /\/content\/(?<languageId>\d+)\.xliff/.exec(
          language[0].file
        )?.groups?.languageId

        if (languageId != null) {
          const data = schema.parse(await xliff12ToJs(language[0].content))
          try {
            await storeTranslations(languageId, data, logger)
          } catch (e) {
            console.log(e)
          }
        } else {
          throw new Error(
            `export filename does not match format or custom mapping not set: ${language[0].file}`
          )
        }
      })
    )
  }

  // for (const languageCode in languages) {
  //   const languageId = /\/content\/(?<languageId>\d+)\.xliff/.exec(
  //     languages[languageCode][0].file
  //   )?.groups?.languageId

  //   if (languageId != null) {
  //     const res = await xliff12ToJs(languages[languageCode][0].content)
  //     const data = schema.parse(res)
  //     await storeTranslations(languageId, data, logger)
  //   } else {
  //     throw new Error(
  //       `export filename does not match format or custom mapping not set: ${languages[languageCode][0].file}`
  //     )
  //   }
  // }

  logger?.info('crowdin import finished')
  console.timeEnd()
}

async function storeTranslations(
  languageId: string,
  data: CrowdinData,
  logger?: Logger
): Promise<void> {
  logger?.info(`storing translation ${languageId}`)
  const fileNames = Object.keys(data.resources)
  const videos = await prisma.video.findMany({
    include: { title: true, description: true, studyQuestions: true }
  })

  const studyQuestions = await prisma.videoStudyQuestion.findMany()

  for (const name of fileNames) {
    const translationCodes = Object.keys(data.resources[name])
    switch (name) {
      case '/Arclight/media_metadata_tile.csv':
      case '/Arclight/collection_title.csv':
        {
          const update: any = []
          const create: Prisma.VideoTitleCreateManyInput[] = []

          for (const code of translationCodes) {
            const translation = data.resources[name][code]
            if (
              translation.source.localeCompare(translation.target) === 0 ||
              translation.additionalAttributes?.translate === 'no' ||
              translation.additionalAttributes?.resname == null
            )
              continue

            const video = videos.find((video) =>
              video.id.endsWith(
                translation.additionalAttributes?.resname as string
              )
            )
            if (video == null) {
              const videoId = translation.additionalAttributes?.resname
              logger?.error({ videoId }, 'no matching videoId found')
              continue
            }
            const title = video.title.find((title) => {
              return title.languageId === languageId
            })
            if (title == null)
              create.push({
                value: translation.target,
                languageId,
                primary: false,
                videoId: video.id
              })

            if (title?.value !== translation.target)
              update.push({
                languageId,
                videoId: video.id,
                value: translation.target
              })
          }

          if (create.length > 0)
            await prisma.videoTitle.createMany({ data: create })

          if (update.length > 0)
            for (const item of update) {
              await prisma.videoTitle.update({
                where: {
                  videoId_languageId: {
                    videoId: item.videoId,
                    languageId: item.languageId
                  }
                },
                data: {
                  value: item.value
                }
              })
            }
        }
        break
      case '/Arclight/collection_long_description.csv':
      case '/Arclight/media_metadata_description.csv':
        {
          const update: any = []
          const create: Prisma.VideoDescriptionCreateManyInput[] = []

          for (const code of translationCodes) {
            const translation = data.resources[name][code]
            if (
              translation.source.localeCompare(translation.target) === 0 ||
              translation.additionalAttributes?.translate === 'no' ||
              translation.additionalAttributes?.resname == null
            )
              continue

            const video = videos.find((video) =>
              video.id.endsWith(
                translation.additionalAttributes?.resname as string
              )
            )
            if (video == null) {
              const videoId = translation.additionalAttributes?.resname
              logger?.error({ videoId }, 'no matching videoId found')
              continue
            }
            const description = video.description.find((title) => {
              return title.languageId === languageId
            })
            if (description == null)
              create.push({
                value: translation.target,
                languageId,
                primary: false,
                videoId: video.id
              })

            if (description?.value !== translation.target)
              update.push({
                languageId,
                videoId: video.id,
                value: translation.target
              })
          }

          if (create.length > 0)
            await prisma.videoDescription.createMany({ data: create })

          if (update.length > 0)
            for (const item of update) {
              await prisma.videoDescription.update({
                where: {
                  videoId_languageId: {
                    videoId: item.videoId,
                    languageId: item.languageId
                  }
                },
                data: {
                  value: item.value
                }
              })
            }
        }
        break
      case '/Arclight/study_questions.csv':
        {
          const update: any = []
          const toValidate: Prisma.VideoStudyQuestionCreateManyInput[] = []
          const create: Prisma.VideoStudyQuestionCreateManyInput[] = []

          for (const code of translationCodes) {
            const translation = data.resources[name][code]
            if (
              translation.source.localeCompare(translation.target) === 0 ||
              translation.additionalAttributes?.translate === 'no' ||
              translation.additionalAttributes?.resname == null
            )
              continue

            const resName = translation.additionalAttributes?.resname

            // const englishStudyQuestions = await getStudyQuestions(resName)
            const englishStudyQuestions = studyQuestions.filter(
              (question) => question.crowdInId === resName
            )

            if (englishStudyQuestions.length === 0) {
              logger?.error({ resName }, 'no matching crowdInId found')
            } else {
              for (const englishStudyQuestion of englishStudyQuestions) {
                const videoId = englishStudyQuestion.videoId
                if (videoId == null) {
                  logger?.error(
                    { resName },
                    'video id is null for study question for crowdinId'
                  )
                } else {
                  // const _studyQuestion =
                  //   await prisma.videoStudyQuestion.findUnique({
                  //     where: {
                  //       videoId_languageId_order: {
                  //         videoId,
                  //         languageId,
                  //         order: englishStudyQuestion.order
                  //       }
                  //     }
                  //   })

                  toValidate.push({
                    videoId,
                    languageId,
                    value: translation.target,
                    crowdInId: resName,
                    order: englishStudyQuestion.order,
                    primary: false
                  })

                  // await prisma.videoStudyQuestion.upsert({
                  //   where: {
                  //     videoId_languageId_order: {
                  //       videoId,
                  //       languageId,
                  //       order
                  //     }
                  //   },
                  //   update: {
                  //     value
                  //   },
                  //   create: {
                  //     value,
                  //     languageId,
                  //     primary: false,
                  //     videoId,
                  //     order,
                  //     crowdInId: resName
                  //   }
                  // })
                  // await updateStudyQuestion(
                  //   videoId,
                  //   languageId,
                  //   translation.target,
                  //   resName,
                  //   englishStudyQuestion.order
                  // )
                }
              }
            }
            // const englishStudyQuestions =
            //   await prisma.videoStudyQuestion.findMany({
            //     select: {
            //       videoId: true,
            //       order: true
            //     },
            //     where: { crowdInId: translation.additionalAttributes?.resname }
            //   })

            // const englishStudyQuestions = studyQuestions.filter(
            //   (question) =>
            //     question.crowdInId ===
            //       translation.additionalAttributes?.resname &&
            //     question.languageId === '529'
            // )

            // for (const englishStudyQuestion of englishStudyQuestions) {
            //   if (englishStudyQuestion.videoId == null) continue

            //   const studyQuestion = await prisma.videoStudyQuestion.findUnique({
            //     where: {
            //       videoId_languageId_order: {
            //         videoId: englishStudyQuestion.videoId,
            //         languageId,
            //         order: englishStudyQuestion.order
            //       }
            //     }
            //   })
            //   // const studyQuestion = studyQuestions.find(
            //   //   (question) =>
            //   //     question.videoId ===
            //   //       (englishStudyQuestion.videoId as string) &&
            //   //     question.languageId === languageId &&
            //   //     question.order === englishStudyQuestion.order
            //   // )

            //   if (studyQuestion == null) {
            //     create.push({
            //       value: translation.target,
            //       languageId,
            //       primary: false,
            //       videoId: englishStudyQuestion.videoId,
            //       order: englishStudyQuestion.order,
            //       crowdInId: translation.additionalAttributes?.resname
            //     })
            //   }

            //   if (studyQuestion?.value !== translation.target)
            //     update.push({
            //       value: translation.target,
            //       languageId,
            //       primary: false,
            //       videoId: englishStudyQuestion.videoId,
            //       order: englishStudyQuestion.order,
            //       crowdInId: translation.additionalAttributes?.resname
            //     })
            // }
            for (const c of toValidate) {
              const findUnique = studyQuestions.find(
                (question) =>
                  question.languageId === c.languageId &&
                  question.order === c.order &&
                  question.videoId === c.videoId
              )
              if (findUnique == null) {
                create.push(c)
              } else {
                update.push(c)
              }
            }
            if (create.length > 0) {
              await prisma.videoStudyQuestion.createMany({ data: create })
            }
            if (update.length > 0) {
              for (const item of update) {
                await prisma.videoStudyQuestion.update({
                  where: {
                    videoId_languageId_order: {
                      videoId: item.videoId,
                      languageId: item.languageId,
                      order: item.order
                    }
                  },
                  data: {
                    value: item.value
                  }
                })
              }
            }

            // await updateStudyQuestion(
            //   videoId,
            //   languageId,
            //   value,
            //   resName,
            //   englishStudyQuestion.order
            // )
          }
        }
        break
    }
  }

  // old code
  // await Promise.all(
  //   map(data.resources, async (translations, fileName) => {
  //     await Promise.all(
  //       map(translations, async ({ source, target, additionalAttributes }) => {
  //         if (
  //           source.localeCompare(target) === 0 ||
  //           additionalAttributes?.translate === 'no' ||
  //           additionalAttributes?.resname == null
  //         )
  //           return
  //         await storeTranslation(
  //           languageId,
  //           target,
  //           additionalAttributes.resname,
  //           fileName
  //         )
  //       })
  //     )
  //   })
  // )
  logger?.info(`finished storing translation ${languageId}`)
}

async function storeTranslation(
  languageId: string,
  value: string,
  resName: string,
  fileName: CrowdinFileName,
  logger?: Logger
): Promise<void> {
  switch (fileName) {
    case '/Arclight/media_metadata_tile.csv':
    case '/Arclight/collection_title.csv':
      {
        const videoId = resName
        const video = await getVideoById(videoId)
        if (video == null) {
          logger?.error({ videoId }, 'no matching videoId found')
        } else {
          await updateVideoTitle(video, languageId, value)
        }
      }
      break
    case '/Arclight/collection_long_description.csv':
    case '/Arclight/media_metadata_description.csv':
      {
        const videoId = resName
        const video = await getVideoById(videoId)
        if (video == null) {
          logger?.error({ videoId }, 'no matching videoId found')
        } else {
          await updateVideoDescription(video, languageId, value)
        }
      }
      break
    case '/Arclight/study_questions.csv':
      {
        const englishStudyQuestions = await getStudyQuestions(resName)
        if (englishStudyQuestions.length === 0) {
          logger?.error({ resName }, 'no matching crowdInId found')
        } else {
          await Promise.all(
            map(englishStudyQuestions, async (englishStudyQuestion) => {
              const videoId = englishStudyQuestion.videoId
              if (videoId == null) {
                logger?.error({ resName }, 'no matching videoId found')
              } else {
                await updateStudyQuestion(
                  videoId,
                  languageId,
                  value,
                  resName,
                  englishStudyQuestion.order
                )
              }
            })
          )
        }
      }
      break
    case '/Arclight/Bible_books.csv':
      {
        const bibleBookId = resName
        const bibleBooks = await getBibleBooks(bibleBookId)
        if (bibleBooks.length === 0) {
          logger?.error({ bibleBookId }, 'no matching bibleBookId found')
        } else {
          await updateBibleBookName(bibleBookId, languageId, value)
        }
      }
      break
  }
}

async function getVideoById(videoId: string): Promise<string | undefined> {
  return (
    await prisma.video.findFirst({
      select: { id: true },
      where: { id: { endsWith: videoId } }
    })
  )?.id
}

async function updateVideoTitle(
  videoId: string,
  languageId: string,
  value: string
): Promise<void> {
  await prisma.videoTitle.upsert({
    where: { videoId_languageId: { videoId, languageId } },
    update: { value },
    create: { value, languageId, primary: false, videoId }
  })
}

async function updateVideoDescription(
  videoId: string,
  languageId: string,
  value: string
): Promise<void> {
  await prisma.videoDescription.upsert({
    where: { videoId_languageId: { videoId, languageId } },
    update: { value },
    create: { value, languageId, primary: false, videoId }
  })
}

async function getStudyQuestions(resName: string): Promise<
  Array<{
    order: number
    videoId: string | null
  }>
> {
  const res = await prisma.videoStudyQuestion.findMany({
    select: {
      videoId: true,
      order: true
    },
    where: { crowdInId: resName }
  })
  return res
}

async function updateStudyQuestion(
  videoId: string,
  languageId: string,
  value: string,
  resName: string,
  order: number
): Promise<void> {
  await prisma.videoStudyQuestion.upsert({
    where: {
      videoId_languageId_order: {
        videoId,
        languageId,
        order
      }
    },
    update: {
      value
    },
    create: {
      value,
      languageId,
      primary: false,
      videoId,
      order,
      crowdInId: resName
    }
  })
}

async function getBibleBooks(bibleBookId: string): Promise<
  Array<{
    id: string
  }>
> {
  const res = await prisma.bibleBook.findMany({
    select: { id: true },
    where: { id: bibleBookId }
  })
  return res
}

async function updateBibleBookName(
  bibleBookId: string,
  languageId: string,
  value: string
): Promise<void> {
  await prisma.bibleBookName.upsert({
    where: {
      bibleBookId_languageId: {
        bibleBookId,
        languageId
      }
    },
    update: {
      value
    },
    create: {
      value,
      bibleBookId,
      languageId,
      primary: false
    }
  })
}

export async function service(logger?: Logger): Promise<void> {
  try {
    await pullTranslations(logger)
  } catch (e) {
    if (e instanceof Error) {
      logger?.warn(`${e.message}`)
      throw new Error(e.message)
    }
  }
}
