import OtaClient from '@crowdin/ota-client'
import map from 'lodash/map'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma'

const xliff12ToJs = require('xliff')

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

export async function service(logger?: Logger): Promise<void> {
  try {
    logger?.info('crowdin import started')

    if (process.env.CROWDIN_DISTRIBUTION_HASH == null) {
      logger?.error('crowdin distribution hash not set')
      throw new Error('crowdin distribution hash not set')
    }

    const client = new OtaClient(process.env.CROWDIN_DISTRIBUTION_HASH, {
      disableManifestCache: true,
      disableStringsCache: true
    })

    const languages = await client.getTranslations()
    const languageCount = Object.keys(languages).length
    logger?.info({ languageCount }, 'fetched languages from crowdin')

    for (const languageCode in languages) {
      try {
        const languageId = /\/content\/(\d+)\.xliff/.exec(
          languages[languageCode][0].file
        )?.[1]

        if (languageId != null) {
          const res = await xliff12ToJs(languages[languageCode][0].content)
          const data = schema.parse(res)
          logger?.info({ languageId }, 'processing translations')
          await storeTranslations(languageId, data, logger)
          logger?.info({ languageId }, 'translations stored')
        } else {
          const errorMsg = `export filename does not match format or custom mapping not set: ${languages[languageCode][0].file}`
          logger?.error(
            { languageCode, file: languages[languageCode][0].file },
            errorMsg
          )
          throw new Error(errorMsg)
        }
      } catch (error) {
        logger?.error({ error, languageCode }, 'failed to process language')
        throw error
      }
    }

    logger?.info('crowdin import completed')
  } catch (error) {
    logger?.error({ error }, 'crowdin import failed')
    throw error
  }
}

async function storeTranslations(
  languageId: string,
  data: CrowdinData,
  logger?: Logger
): Promise<void> {
  const resourceCount = Object.keys(data.resources).length
  logger?.info({ languageId, resourceCount }, 'storing translations')

  await Promise.all(
    map(data.resources, async (translations, fileName) => {
      await Promise.all(
        map(translations, async ({ source, target, additionalAttributes }) => {
          if (
            source.localeCompare(target) === 0 ||
            additionalAttributes?.translate === 'no' ||
            additionalAttributes?.resname == null
          )
            return
          await storeTranslation(
            languageId,
            target,
            additionalAttributes.resname,
            fileName,
            logger
          )
        })
      )
    })
  )
  logger?.info({ languageId }, 'translations stored')
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
        const videos = await getVideos(videoId)
        if (videos.length === 0) {
          logger?.warn({ videoId, fileName }, 'no matching videoId found')
        } else {
          await updateVideoTitle(videos[0].id, languageId, value)
        }
      }
      break
    case '/Arclight/collection_long_description.csv':
    case '/Arclight/media_metadata_description.csv':
      {
        const videoId = resName
        const videos = await getVideos(videoId)
        if (videos.length === 0) {
          logger?.warn({ videoId, fileName }, 'no matching videoId found')
        } else {
          await updateVideoDescription(videos[0].id, languageId, value)
        }
      }
      break
    case '/Arclight/study_questions.csv':
      {
        const englishStudyQuestions = await getStudyQuestions(resName)
        if (englishStudyQuestions.length === 0) {
          logger?.warn({ resName, fileName }, 'no matching crowdInId found')
        }

        await Promise.all(
          map(englishStudyQuestions, async (englishStudyQuestion) => {
            const videoId = englishStudyQuestion.videoId
            if (videoId == null) {
              logger?.warn({ resName, fileName }, 'no matching videoId found')
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
      break
    case '/Arclight/Bible_books.csv':
      {
        const bibleBookId = resName
        const bibleBooks = await getBibleBooks(bibleBookId)
        if (bibleBooks.length === 0) {
          logger?.warn(
            { bibleBookId, fileName },
            'no matching bibleBookId found'
          )
        }
        await updateBibleBookName(bibleBookId, languageId, value)
      }
      break
  }
}

async function getVideos(videoId: string): Promise<
  Array<{
    id: string
  }>
> {
  const res = await prisma.video.findMany({
    select: { id: true },
    where: { id: { endsWith: videoId } }
  })
  return res
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
