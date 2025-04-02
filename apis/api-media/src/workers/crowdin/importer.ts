import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { StringTranslationsModel } from '@crowdin/crowdin-api-client/out/stringTranslations'
import { Logger } from 'pino'

export type CrowdinTranslation =
  | StringTranslationsModel.PlainLanguageTranslation
  | StringTranslationsModel.PluralLanguageTranslation
  | StringTranslationsModel.IcuLanguageTranslation

export interface ArclightFile {
  id: number
  name: string
  title: string
  path: string
}

export interface TranslationData {
  sourceString: SourceStringsModel.String
  translation: CrowdinTranslation
  languageCode: string
}

export const ARCLIGHT_FILES = {
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

export const CROWDIN_LANGUAGE_CODE_TO_ID = {
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
} as const

export class BaseTranslation {
  protected readonly projectId = 47654

  constructor(
    protected readonly sourceStringsApi: SourceStrings,
    protected readonly stringTranslationsApi: StringTranslations,
    protected readonly logger?: Logger
  ) {}

  protected async fetchSourceStrings(
    fileId: number
  ): Promise<Array<{ data: SourceStringsModel.String }>> {
    let allSourceStrings: Array<{ data: SourceStringsModel.String }> = []
    let offset = 0
    const limit = 500

    while (true) {
      const response = await this.sourceStringsApi.listProjectStrings(
        this.projectId,
        {
          fileId,
          limit,
          offset
        }
      )

      allSourceStrings = allSourceStrings.concat(response.data)

      if (response.data.length < limit) {
        break
      }
      offset += limit
    }

    return allSourceStrings
  }

  protected async processLanguage(
    languageCode: string,
    file: ArclightFile,
    sourceStringMap: Map<number, SourceStringsModel.String>,
    validateData: (data: TranslationData) => boolean,
    upsertTranslation: (data: TranslationData) => Promise<void>
  ): Promise<void> {
    this.logger?.info(`Fetching translations for ${languageCode}`)

    try {
      const translations = await this.fetchTranslations(languageCode, file.id)
      this.logger?.info(
        { count: translations.length, languageCode },
        'Total translations fetched'
      )

      if (translations.length > 0) {
        this.logger?.info('Processing translations...')
        await this.processTranslations(
          translations,
          sourceStringMap,
          languageCode,
          validateData,
          upsertTranslation
        )
      }
    } catch (error: any) {
      if (error?.code === 404) {
        this.logger?.warn(`Language ${languageCode} not configured in project`)
        return
      }
      throw error
    }
  }

  protected async fetchTranslations(
    languageCode: string,
    fileId: number
  ): Promise<CrowdinTranslation[]> {
    let allTranslations: CrowdinTranslation[] = []
    let offset = 0
    const limit = 500

    while (true) {
      const translations =
        await this.stringTranslationsApi.listLanguageTranslations(
          this.projectId,
          languageCode,
          {
            fileId,
            limit,
            offset
          }
        )

      allTranslations = allTranslations.concat(
        translations.data.map((t: { data: CrowdinTranslation }) => t.data)
      )

      this.logger?.debug(
        { count: translations.data.length, offset },
        'Fetched translations batch'
      )

      if (translations.data.length < limit) {
        break
      }
      offset += limit
    }

    return allTranslations
  }

  protected async processTranslations(
    translations: CrowdinTranslation[],
    sourceStringMap: Map<number, SourceStringsModel.String>,
    languageCode: string,
    validateData: (data: TranslationData) => boolean,
    upsertTranslation: (data: TranslationData) => Promise<void>
  ): Promise<void> {
    const validTranslations: TranslationData[] = []

    for (const translation of translations) {
      const sourceString = sourceStringMap.get(translation.stringId)
      if (!sourceString) continue

      const data = { sourceString, translation, languageCode }
      if (!validateData(data)) continue

      validTranslations.push(data)
    }

    this.logger?.info(
      { count: validTranslations.length },
      'Found valid translations to upsert'
    )

    if (validTranslations.length > 0) {
      for (const data of validTranslations) {
        await upsertTranslation(data)
      }
      this.logger?.info(
        `Successfully upserted ${validTranslations.length} translations`
      )
    } else {
      this.logger?.warn('No valid translations to upsert')
    }
  }

  protected getTranslationText(
    translation: CrowdinTranslation
  ): string | undefined {
    if ('text' in translation && typeof translation.text === 'string') {
      return translation.text
    } else if (
      'plurals' in translation &&
      translation.plurals &&
      typeof translation.plurals === 'object' &&
      'one' in translation.plurals &&
      typeof translation.plurals.one === 'string'
    ) {
      return translation.plurals.one
    }
    return undefined
  }

  async processFile(
    file: ArclightFile,
    validateData: (data: TranslationData) => boolean,
    upsertTranslation: (data: TranslationData) => Promise<void>
  ): Promise<void> {
    this.logger?.info({ fileName: file.name }, 'Fetching strings from file')
    const sourceStrings = await this.fetchSourceStrings(file.id)

    if (sourceStrings.length === 0) {
      this.logger?.info('❌ No strings found to translate')
      return
    }

    this.logger?.info(
      { count: sourceStrings.length, fileName: file.name },
      'Found strings in file'
    )
    const sourceStringMap = new Map(
      sourceStrings.map(({ data }) => [data.id, data])
    )

    for (const languageCode in CROWDIN_LANGUAGE_CODE_TO_ID) {
      await this.processLanguage(
        languageCode,
        file,
        sourceStringMap,
        validateData,
        upsertTranslation
      )
    }
  }
}
