import { Readable } from 'stream'

import crowdin, {
  Credentials,
  CrowdinError,
  CrowdinValidationError
} from '@crowdin/crowdin-api-client'
import { LanguagesModel } from '@crowdin/crowdin-api-client/out/languages'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { StringTranslationsModel } from '@crowdin/crowdin-api-client/out/stringTranslations'
import { parse } from '@fast-csv/parse'
import { prisma } from '../../../lib/prisma'

const CROWDIN_LANGUAGE_CODE_TO_ID = {
  ko: '3804',
  ar: '139485',
  'es-MX': '21028',
  'pt-BR': '584',
  tr: '1942',
  'zh-CN': '21754',
  fa: '6788',
  'ur-PK': '407',
  he: '6930',
  hi: '6464',
  fr: '496',
  'zh-TW': '21753',
  ru: '3934',
  de: '1106',
  id: '16639',
  ja: '7083',
  vi: '3887',
  th: '13169'
}

const ARCLIGHT_FILES = {
  collection_title: {
    id: 31,
    name: 'collection_title.csv',
    title: 'Collection Titles',
    path: '/Arclight/collection_title.csv'
  },
  collection_long_description: {
    id: 33,
    name: 'collection_long_description.csv',
    title: 'Collection Long Descriptions',
    path: '/Arclight/collection_long_description.csv'
  },
  media_metadata_tile: {
    id: 34,
    name: 'media_metadata_tile.csv',
    title: 'Video Titles',
    path: '/Arclight/media_metadata_tile.csv'
  },
  media_metadata_description: {
    id: 35,
    name: 'media_metadata_description.csv',
    title: 'Video Long Descriptions',
    path: '/Arclight/media_metadata_description.csv'
  },
  bible_books: {
    id: 36,
    name: 'Bible_books.csv',
    title: 'Bible Books',
    path: '/Arclight/Bible_books.csv'
  },
  study_questions: {
    id: 37,
    name: 'study_questions.csv',
    title: 'Study Questions',
    path: '/Arclight/study_questions.csv'
  }
} as const

const TITLE_FILES = [
  ARCLIGHT_FILES.collection_title,
  ARCLIGHT_FILES.media_metadata_tile
]

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function service(): Promise<void> {
  console.log('🚀 Starting Crowdin translation import...')

  if (!process.env.CROWDIN_API_KEY) {
    throw new Error('Crowdin API key not set')
  }

  const credentials: Credentials = {
    token: process.env.CROWDIN_API_KEY
  }

  try {
    const { sourceFilesApi, translationStatusApi } = new crowdin(credentials)
    const projectId = 47654

    // Process each file
    for (const file of TITLE_FILES) {
      console.log(`\n📥 Processing file: ${file.name}`)

      // Download the file with translations
      const downloadResponse = await sourceFilesApi.downloadFile(
        projectId,
        file.id
      )
      console.log('Downloading translations...')

      // Get the file content using the download URL
      const response = await fetch(downloadResponse.data.url)
      const fileContent = await response.arrayBuffer()
      const translations = await processTranslationFile(
        Buffer.from(fileContent)
      )

      // Batch update database
      console.log(
        `Updating database with ${translations.length} translations...`
      )
      let successCount = 0
      const batchSize = 100

      for (let i = 0; i < translations.length; i += batchSize) {
        const batch = translations.slice(i, i + batchSize)
        try {
          await prisma.$transaction(
            batch.map(({ videoId, languageId, value }) =>
              prisma.videoTitle.upsert({
                where: {
                  videoId_languageId: { videoId, languageId }
                },
                update: { value, primary: true },
                create: { videoId, languageId, value, primary: true }
              })
            )
          )
          successCount += batch.length
          console.log(
            `Processed ${successCount}/${translations.length} translations`
          )
        } catch (error) {
          console.error(
            `Failed to process batch:`,
            error instanceof Error ? error.message : error
          )
        }
      }

      console.log(`✅ Completed processing ${file.name}`)
    }
  } catch (error: unknown) {
    if (error instanceof CrowdinValidationError) {
      console.error('\n❌ Validation error:', error.message)
    } else if (error instanceof CrowdinError) {
      console.error('\n❌ API error:', error.code, error.message)
    } else if (error instanceof Error) {
      console.error('\n❌ Unexpected error:', error.message)
    } else {
      console.error('\n❌ Unexpected error:', error)
    }
    throw error
  }
}

interface Translation {
  videoId: string
  languageId: string
  value: string
}

async function processTranslationFile(
  fileData: Buffer
): Promise<Translation[]> {
  return new Promise((resolve, reject) => {
    const translations: Translation[] = []
    const parser = parse({
      headers: true,
      ignoreEmpty: true
    })

    Readable.from(fileData)
      .pipe(parser)
      .on('data', (row: any) => {
        const videoId = row.identifier?.split('/')[0]
        if (!videoId) return

        Object.entries(CROWDIN_LANGUAGE_CODE_TO_ID).forEach(
          ([, languageId]) => {
            const value = row[languageId]
            if (value) {
              translations.push({ videoId, languageId, value })
            }
          }
        )
      })
      .on('end', () => resolve(translations))
      .on('error', reject)
  })
}
