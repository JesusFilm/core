import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { Logger } from 'pino'

import { CROWDIN_CONFIG } from './config'
import { parseSourceStrings, parseTranslations } from './schemas'
import {
  ArclightFile,
  CrowdinApis,
  CrowdinError,
  CrowdinTranslation,
  ProcessedTranslation,
  TranslationData,
  createCrowdinApiError
} from './types'

export async function fetchSourceStrings(
  fileId: number,
  api: SourceStrings
): Promise<Array<SourceStringsModel.String>> {
  try {
    let allSourceStrings: unknown[] = []
    let offset = 0
    const limit = 500

    while (true) {
      const response = await api.listProjectStrings(CROWDIN_CONFIG.projectId, {
        fileId,
        limit,
        offset
      })

      allSourceStrings = allSourceStrings.concat(
        response.data.map((d) => d.data)
      )

      if (response.data.length < limit) {
        break
      }
      offset += limit
    }

    const { validStrings, invalidStrings } =
      parseSourceStrings(allSourceStrings)

    if (invalidStrings.length > 0) {
      throw createCrowdinApiError(
        `Invalid source strings found: ${invalidStrings.map((s) => s.error).join(', ')}`,
        undefined,
        fileId
      )
    }

    return validStrings as unknown as Array<SourceStringsModel.String>
  } catch (error) {
    throw createCrowdinApiError(
      `Failed to fetch source strings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      fileId
    )
  }
}

export async function fetchTranslations(
  languageCode: string,
  fileId: number,
  api: StringTranslations
): Promise<CrowdinTranslation[]> {
  try {
    let allTranslations: unknown[] = []
    const limit = 500
    let offset = 0

    while (true) {
      const translations = await api.listLanguageTranslations(
        CROWDIN_CONFIG.projectId,
        languageCode,
        {
          fileId,
          limit,
          offset
        }
      )

      allTranslations = allTranslations.concat(
        translations.data.map((t) => t.data)
      )

      if (translations.data.length < limit) {
        break
      }
      offset += limit
    }

    const { validTranslations, invalidTranslations } =
      parseTranslations(allTranslations)

    if (invalidTranslations.length > 0) {
      throw createCrowdinApiError(
        `Invalid translations found: ${invalidTranslations.map((t) => t.error).join(', ')}`,
        undefined,
        fileId,
        languageCode
      )
    }

    return validTranslations as CrowdinTranslation[]
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as any).code === 404
    ) {
      throw createCrowdinApiError(
        `Language ${languageCode} not configured in project`,
        404,
        fileId,
        languageCode
      )
    }
    throw createCrowdinApiError(
      `Failed to fetch translations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      fileId,
      languageCode
    )
  }
}

export async function processTranslations(
  translations: CrowdinTranslation[],
  sourceStringMap: Map<number, SourceStringsModel.String>,
  languageCode: string,
  validateData: (data: TranslationData) => boolean
): Promise<ProcessedTranslation[]> {
  const validTranslations: ProcessedTranslation[] = []

  for (const translation of translations) {
    const sourceString = sourceStringMap.get(translation.stringId)
    if (!sourceString) continue

    const data = { sourceString, translation, languageCode }
    if (!validateData(data)) continue

    validTranslations.push(data)
  }

  return validTranslations
}

export async function processLanguage(
  languageCode: string,
  file: ArclightFile,
  sourceStringMap: Map<number, SourceStringsModel.String>,
  validateData: (data: TranslationData) => boolean,
  upsertTranslation: (data: TranslationData) => Promise<void>,
  apis: CrowdinApis,
  logger?: Logger
): Promise<void> {
  logger?.info(`Fetching translations for ${languageCode}`)

  try {
    const translations = await fetchTranslations(
      languageCode,
      file.id,
      apis.stringTranslations
    )
    logger?.info(
      { count: translations.length, languageCode },
      'Total translations fetched'
    )

    if (translations.length > 0) {
      logger?.info('Processing translations...')
      const validTranslations = await processTranslations(
        translations,
        sourceStringMap,
        languageCode,
        validateData
      )

      logger?.info(
        { count: validTranslations.length },
        'Found valid translations to upsert'
      )

      if (validTranslations.length > 0) {
        for (const data of validTranslations) {
          await upsertTranslation(data)
        }
        logger?.info(
          `Successfully upserted ${validTranslations.length} translations`
        )
      } else {
        logger?.warn('No valid translations to upsert')
      }
    }
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as any).code === 404
    ) {
      logger?.warn(`Language ${languageCode} not configured in project`)
      return
    }
    throw error
  }
}

export function getTranslationText(
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

export async function processFile(
  file: ArclightFile,
  importOne: (data: TranslationData) => Promise<void>,
  importMany: (data: TranslationData[]) => Promise<void>,
  apis: CrowdinApis,
  parentLogger?: Logger
): Promise<void> {
  const logger = parentLogger?.child({
    file: file.name.replace('.csv', '')
  })

  logger?.info('file import started')
  const errors: CrowdinError[] = []

  try {
    const sourceStrings = await fetchSourceStrings(file.id, apis.sourceStrings)
    if (sourceStrings.length === 0) {
      logger?.info('❌ No strings found to translate')
      return
    }

    logger?.info(
      { count: sourceStrings.length, fileName: file.name },
      'Found strings in file'
    )
    const sourceStringMap = new Map(sourceStrings.map((str) => [str.id, str]))

    let page = 0
    for (const languageCode of Object.keys(CROWDIN_CONFIG.languageCodes)) {
      try {
        const translations = await fetchTranslations(
          languageCode,
          file.id,
          apis.stringTranslations
        )

        if (translations.length > 0) {
          page++
          logger?.info(
            { page, translations: translations.length, languageCode },
            'importing language batch'
          )

          const validTranslations = await processTranslations(
            translations,
            sourceStringMap,
            languageCode,
            () => true
          )

          if (validTranslations.length > 0) {
            try {
              await importMany(validTranslations)
            } catch (error) {
              if (error instanceof Error) {
                errors.push({
                  fileId: file.id,
                  languageCode,
                  message: error.message
                })
              }
            }
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          (error as any).code === 404
        ) {
          // Skip 404 errors (language not configured)
          continue
        }
        errors.push({
          fileId: file.id,
          languageCode,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (errors.length > 0) {
      logger?.error({ errors }, 'file import finished with errors')
    } else {
      logger?.info('file import finished successfully')
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    logger?.error({ error: errorMessage }, 'file import failed')
    throw error
  }
}
