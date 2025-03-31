import crowdin, {
  Credentials,
  CrowdinError,
  CrowdinValidationError
} from '@crowdin/crowdin-api-client'
import { LanguagesModel } from '@crowdin/crowdin-api-client/out/languages'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { StringTranslationsModel } from '@crowdin/crowdin-api-client/out/stringTranslations'

import { prisma } from '../../../lib/prisma'

// const CROWDIN_LANGUAGE_CODE_TO_ID = {
//   ko: 3804,
//   ar: 139485,
//   'es-MX': 21028,
//   'pt-BR': 584,
//   tr: 1942,
//   'zh-CN': 21754,
//   fa: 6788,
//   'ur-PK': 407,
//   he: 6930,
//   hi: 6464,
//   fr: 496,
//   'zh-TW': 21753,
//   ru: 3934,
//   de: 1106,
//   id: 16639,
//   ja: 7083,
//   vi: 3887,
//   th: 13169
// }

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

// Currently used files for video titles
const TITLE_FILES = [
  ARCLIGHT_FILES.collection_title,
  ARCLIGHT_FILES.media_metadata_tile
]

export async function service(): Promise<void> {
  console.log('🚀 Starting Crowdin translation import...')

  if (!process.env.CROWDIN_API_KEY) {
    throw new Error('Crowdin API key not set')
  }

  const credentials: Credentials = {
    token: process.env.CROWDIN_API_KEY
  }

  try {
    const { stringTranslationsApi, sourceStringsApi, languagesApi } =
      new crowdin(credentials)
    const projectId = 47654 // JFM - Arclight project
    const targetLanguageCode = 'ru' // Russian language code

    // Get all supported languages
    console.log('\n🌐 Getting language information...')
    let allLanguages: { data: LanguagesModel.Language }[] = []
    let offset = 0
    const limit = 500

    while (true) {
      const response = await languagesApi.listSupportedLanguages({
        limit,
        offset
      })
      allLanguages = allLanguages.concat(response.data)

      if (response.data.length < limit) {
        break
      }
      offset += limit
    }

    // Sort languages by name
    allLanguages.sort((a, b) => a.data.name.localeCompare(b.data.name))

    // Find Russian language
    const targetLanguage = allLanguages[0]

    if (!targetLanguage) {
      console.log('\n❌ Language not found. Available codes:')
      allLanguages.forEach((lang) => {
        console.log(
          `   ${lang.data.id} - ${lang.data.name} (${lang.data.locale})`
        )
      })
      throw new Error(
        `Language code ${targetLanguageCode} not found. Please use one of the codes above.`
      )
    }

    console.log('\n📋 Russian Language Details:')
    console.log(JSON.stringify(targetLanguage.data, null, 2))
    console.log(
      `\n✅ Found language: ${targetLanguage.data.name} (${targetLanguage.data.locale})`
    )

    // Get strings from each file
    let allSourceStrings: { data: SourceStringsModel.String }[] = []

    for (const file of TITLE_FILES) {
      console.log(`\n📥 Fetching strings from ${file.name}...`)
      let fileStrings: { data: SourceStringsModel.String }[] = []
      let offset = 0
      const limit = 500

      while (true) {
        const response = await sourceStringsApi.listProjectStrings(projectId, {
          fileId: file.id,
          limit,
          offset
        })

        fileStrings = fileStrings.concat(response.data)
        console.log(
          `   Fetched ${response.data.length} strings (offset: ${offset})`
        )

        if (response.data.length < limit) {
          break // No more strings to fetch
        }

        offset += limit
      }

      console.log(`   Total strings in ${file.name}: ${fileStrings.length}`)
      allSourceStrings = allSourceStrings.concat(fileStrings)
    }

    console.log(
      `\n📝 Found ${allSourceStrings.length} total video title strings`
    )

    if (allSourceStrings.length === 0) {
      console.log('❌ No video title strings found')
      return
    }

    // Group strings by file for better logging
    const stringsByFile = allSourceStrings.reduce(
      (acc, str) => {
        const filePath = str.data.identifier?.split('/')[2] || 'unknown'
        acc[filePath] = acc[filePath] || []
        acc[filePath].push(str)
        return acc
      },
      {} as Record<string, typeof allSourceStrings>
    )

    // Log summary of strings found in each file
    console.log('\n📊 Strings by file:')
    Object.entries(stringsByFile).forEach(([file, strings]) => {
      console.log(`   ${file}: ${strings.length} strings`)
    })

    // Log sample strings from each file
    console.log('\n📋 Sample strings from each file:')
    Object.entries(stringsByFile).forEach(([file, strings]) => {
      console.log(`\n   ${file}:`)
      strings.slice(0, 2).forEach((str, index) => {
        const text =
          typeof str.data.text === 'string'
            ? str.data.text
            : JSON.stringify(str.data.text)
        console.log(
          `     ${index + 1}. ID: ${str.data.id}\n        Text: ${text}`
        )
      })
    })

    // Take the first title string as a test case
    const titleSourceString = allSourceStrings[0]

    // Get Russian translation for this string
    const translations = await stringTranslationsApi.listLanguageTranslations(
      projectId,
      targetLanguage.data.id,
      {
        stringIds: titleSourceString.data.id.toString()
      }
    )

    if (translations.data.length === 0) {
      console.log('❌ No Russian translation found for this title')
      return
    }

    // Log complete translation object
    console.log('\n📝 Translation Details:')
    console.log(JSON.stringify(translations.data[0].data, null, 2))

    const translation = translations.data[0]
    const translatedText = getTranslationText(translation.data)

    if (!translatedText) {
      console.log('❌ Could not extract translation text')
      return
    }

    console.log(`\n🔄 Russian translation text: "${translatedText}"`)

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
            languageId: targetLanguage.data.id
          }
        },
        update: {
          value: translatedText,
          primary: true // Making it primary for testing
        },
        create: {
          videoId,
          value: translatedText,
          languageId: targetLanguage.data.id,
          primary: true // Making it primary for testing
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
