import crowdin, {
  Credentials,
  CrowdinError,
  CrowdinValidationError
} from '@crowdin/crowdin-api-client'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { StringTranslationsModel } from '@crowdin/crowdin-api-client/out/stringTranslations'

import { prisma } from '../../../lib/prisma'

const CROWDIN_LANGUAGE_CODE_TO_ID = {
  ru: '3934'
} as const

// const CROWDIN_LANGUAGE_CODE_TO_ID = {
//   ko: '3804',
//   ar: '139485',
//   'es-MX': '21028',
//   'pt-BR': '584',
//   tr: '1942',
//   'zh-CN': '21754',
//   fa: '6788',
//   'ur-PK': '407',
//   he: '6930',
//   hi: '6464',
//   fr: '496',
//   'zh-TW': '21753',
//   ru: '3934',
//   de: '1106',
//   id: '16639',
//   ja: '7083',
//   vi: '3887',
//   th: '13169'
// } as const

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

export async function service(): Promise<void> {
  console.log('🚀 Starting Crowdin translation import for video titles...')

  if (!process.env.CROWDIN_API_KEY) {
    throw new Error('Crowdin API key not set')
  }

  const credentials: Credentials = {
    token: process.env.CROWDIN_API_KEY
  }

  try {
    const { stringTranslationsApi, sourceStringsApi } = new crowdin(credentials)
    const projectId = 47654
    const file = ARCLIGHT_FILES.collection_title

    console.log(`\n📥 Fetching strings from ${file.name}...`)
    let allSourceStrings: { data: SourceStringsModel.String }[] = []
    let offset = 0
    const limit = 500

    while (true) {
      const response = await sourceStringsApi.listProjectStrings(projectId, {
        fileId: file.id,
        limit,
        offset
      })

      allSourceStrings = allSourceStrings.concat(response.data)

      if (response.data.length < limit) {
        break
      }
      offset += limit
    }

    console.log(`   Found ${allSourceStrings.length} strings in ${file.name}`)

    if (allSourceStrings.length === 0) {
      console.log('❌ No strings found to translate')
      return
    }

    // Create a map of string IDs to their source strings for quick lookup
    const sourceStringMap = new Map(
      allSourceStrings.map(({ data }) => [data.id, data])
    )

    // Get all existing video IDs from the database
    const existingVideos = await prisma.video.findMany({
      select: { id: true }
    })
    const existingVideoIds = new Set(existingVideos.map((v) => v.id))
    console.log(`\n📊 Found ${existingVideoIds.size} existing videos`)

    for (const languageCode in CROWDIN_LANGUAGE_CODE_TO_ID) {
      console.log(`\n🔍 Fetching translations for ${languageCode}`)

      try {
        let allTranslations: Array<{
          data:
            | StringTranslationsModel.PlainLanguageTranslation
            | StringTranslationsModel.PluralLanguageTranslation
            | StringTranslationsModel.IcuLanguageTranslation
        }> = []
        let offset = 0
        const limit = 25

        while (true) {
          const translations =
            await stringTranslationsApi.listLanguageTranslations(
              projectId,
              languageCode,
              {
                fileId: file.id,
                limit,
                offset
              }
            )

          allTranslations = allTranslations.concat(translations.data)
          console.log(
            `   ✅ Fetched ${translations.data.length} translations (offset: ${offset})`
          )

          if (translations.data.length < limit) {
            break
          }
          offset += limit
        }

        console.log(
          `   ✨ Total translations for ${languageCode}: ${allTranslations.length}`
        )

        if (allTranslations.length > 0) {
          console.log(`   💾 Processing translations...`)

          const upsertData = allTranslations
            .map((translation) => {
              // Get the corresponding source string
              const sourceString = sourceStringMap.get(
                translation.data.stringId
              )
              console.log('sourceString', Boolean(sourceString?.id))
              if (!sourceString) return null

              // Extract video ID from the source string's identifier
              const videoId = sourceString.identifier
              console.log('videoId', videoId)
              if (!videoId || !existingVideoIds.has(videoId)) {
                console.log(
                  `   ⚠️  Video ${videoId} does not exist in database`
                )
                return null
              }

              // Get the translation text
              const text = getTranslationText(translation.data)
              console.log('text', text)
              if (!text) return null

              return {
                videoId,
                languageId:
                  CROWDIN_LANGUAGE_CODE_TO_ID[
                    languageCode as keyof typeof CROWDIN_LANGUAGE_CODE_TO_ID
                  ],
                value: text,
                primary: false
              }
            })
            .filter((data): data is NonNullable<typeof data> => data !== null)

          console.log(
            `   Found ${upsertData.length} valid translations to upsert:`
          )
          console.log(upsertData)

          if (upsertData.length > 0) {
            const result = await prisma.$transaction(
              upsertData.map((data) =>
                prisma.videoTitle.upsert({
                  where: {
                    videoId_languageId: {
                      videoId: data.videoId,
                      languageId: data.languageId
                    }
                  },
                  update: {
                    value: data.value,
                    primary: data.primary
                  },
                  create: data
                })
              )
            )
            console.log(`   ✅ Upserted ${result.length} video titles`)
          } else {
            console.log(`   ⚠️  No valid translations to upsert`)
          }
        }
      } catch (error) {
        if (error instanceof CrowdinError && error.code === 404) {
          console.log(
            `   ❌ Language ${languageCode} not configured in project`
          )
          continue
        }
        throw error
      }
    }
  } catch (error: unknown) {
    if (error instanceof CrowdinValidationError) {
      console.error('\n❌ Validation error:', error.message)
    } else if (error instanceof CrowdinError) {
      console.error('\n❌ Crowdin API error:', error.code, error.message)
    } else if (error instanceof Error) {
      console.error('\n❌ Unexpected error:', error.message)
    } else {
      console.error('\n❌ Unexpected error:', error)
    }
    throw error
  }
}

function getTranslationText(
  translation:
    | StringTranslationsModel.PlainLanguageTranslation
    | StringTranslationsModel.PluralLanguageTranslation
    | StringTranslationsModel.IcuLanguageTranslation
): string | undefined {
  if ('text' in translation && typeof translation.text === 'string') {
    return translation.text
  } else if ('one' in translation && typeof translation.one === 'string') {
    // For plural translations, return the 'one' form
    return translation.one
  }
  return undefined
}

// Commenting out database operations for now while we debug translations
/*
    // Extract video ID from the identifier
    const identifier = titleSourceString.data.identifier
    const videoId = identifier?.split('/')[0]

    if (!videoId) {
      console.log('❌ Could not extract video ID from identifier')
      return
    }

    // Create or update VideoTitle in database
    try {
      const videoTitle = await prisma.videoTitle.upsert({
        where: {
          videoId_languageId: {
            videoId,
            languageId: parseInt(languageId, 10)
          }
        },
        update: {
          value: translatedText,
          primary: true
        },
        create: {
          videoId,
          value: translatedText,
          languageId: parseInt(languageId, 10),
          primary: true
        }
      })
      console.log(
        `\n✅ ${videoTitle.id ? 'Updated' : 'Created'} VideoTitle: ${JSON.stringify(videoTitle, null, 2)}`
      )
    } catch (error) {
      if (error instanceof Error) {
        console.error('\n❌ Failed to create VideoTitle:', error.message)
      }
      throw error
    }
    */
