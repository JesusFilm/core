import crowdinClient, {
  SourceStrings,
  StringTranslations
} from '@crowdin/crowdin-api-client'
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
  createCrowdinApiError,
  handleCrowdinError
} from './types'

// Export the client instance directly
export const client = new crowdinClient({
  token: process.env.CROWDIN_API_KEY ?? ''
})

export const apis: CrowdinApis = {
  sourceStrings: client.sourceStringsApi,
  stringTranslations: client.stringTranslationsApi
}

export async function processFile(
  file: ArclightFile,
  importOne: (data: TranslationData) => Promise<void>,
  parentLogger?: Logger
): Promise<void> {
  const logger = parentLogger?.child({
    file: file.name.replace('.csv', '')
  })

  logger?.info('file import started for file: ' + file.name)
  const errors: CrowdinError[] = []

  try {
    const sourceStrings = await fetchSourceStrings(
      file.id,
      apis.sourceStrings,
      logger
    )
    if (sourceStrings.length === 0) return

    const sourceStringMap = new Map(sourceStrings.map((str) => [str.id, str]))
    let page = 0

    for (const languageCode of Object.keys(CROWDIN_CONFIG.languageCodes)) {
      try {
        const translations = await fetchTranslations(
          languageCode,
          file.id,
          apis.stringTranslations,
          logger
        )

        if (translations.length === 0) continue
        logger?.info(
          { page, rows: translations.length },
          'importing page for file: ' +
            file.name +
            ' and language: ' +
            languageCode
        )

        page++

        const validTranslations = processTranslations(
          translations,
          sourceStringMap,
          languageCode,
          () => true
        )

        if (validTranslations.length > 0) {
          try {
            for (const data of validTranslations) {
              await importOne(data)
            }
          } catch (error) {
            errors.push({
              fileId: file.id,
              languageCode,
              message: error instanceof Error ? error.message : 'Unknown error'
            })
          }
        }
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          (error as any).code === 404
        ) {
          continue // Skip 404 errors (language not configured)
        }
        errors.push({
          fileId: file.id,
          languageCode,
          message: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (errors.length > 0) {
      logger?.error(
        { errors },
        'file import finished with errors for file: ' + file.name
      )
    } else {
      logger?.info('file import finished for file: ' + file.name)
    }
  } catch (error) {
    logger?.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'file import failed for file: ' + file.name
    )
    throw error
  }
}

async function fetchPaginatedData<T>(
  fetchPage: (
    offset: number,
    limit: number
  ) => Promise<{ data: { data: T }[] }>,
  limit = 500
): Promise<T[]> {
  let allData: T[] = []
  let offset = 0

  while (true) {
    const response = await fetchPage(offset, limit)
    allData = allData.concat(response.data.map((d) => d.data))
    if (response.data.length < limit) break
    offset += limit
  }
  return allData
}

export async function fetchSourceStrings(
  fileId: number,
  api: SourceStrings,
  logger?: Logger
): Promise<Array<SourceStringsModel.String>> {
  try {
    const allSourceStrings = await fetchPaginatedData(
      (offset, limit) =>
        api.listProjectStrings(CROWDIN_CONFIG.projectId, {
          fileId,
          limit,
          offset
        }),
      500
    )

    const { validStrings, invalidStrings } =
      parseSourceStrings(allSourceStrings)

    if (invalidStrings.length > 0) {
      logger?.warn(
        { invalid: invalidStrings.length, total: allSourceStrings.length },
        'invalid source strings'
      )
    }

    if (validStrings.length === 0) {
      throw createCrowdinApiError(
        'No valid source strings found',
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
  api: StringTranslations,
  logger?: Logger
): Promise<CrowdinTranslation[]> {
  try {
    const allTranslations = await fetchPaginatedData(
      (offset, limit) =>
        api.listLanguageTranslations(CROWDIN_CONFIG.projectId, languageCode, {
          fileId,
          limit,
          offset
        }),
      500
    )

    const { validTranslations, invalidTranslations } =
      parseTranslations(allTranslations)

    if (invalidTranslations.length > 0) {
      logger?.warn(
        { invalid: invalidTranslations.length, total: allTranslations.length },
        'invalid translations'
      )
    }

    return validTranslations as CrowdinTranslation[]
  } catch (error) {
    handleCrowdinError(error, fileId, languageCode)
  }
}

export function processTranslations(
  translations: CrowdinTranslation[],
  sourceStringMap: Map<number, SourceStringsModel.String>,
  languageCode: string,
  validateData: (data: TranslationData) => boolean
): ProcessedTranslation[] {
  return translations
    .map((translation) => {
      const sourceString = sourceStringMap.get(translation.stringId)
      if (!sourceString) return null

      const data = { sourceString, translation, languageCode }
      if (!validateData(data)) return null

      return data
    })
    .filter((data): data is ProcessedTranslation => data !== null)
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
  try {
    const translations = await fetchTranslations(
      languageCode,
      file.id,
      apis.stringTranslations,
      logger
    )

    if (translations.length === 0) return

    const validTranslations = processTranslations(
      translations,
      sourceStringMap,
      languageCode,
      validateData
    )

    if (validTranslations.length === 0) return

    for (const data of validTranslations) {
      await upsertTranslation(data)
    }

    logger?.info(
      { processed: validTranslations.length },
      'translations processed'
    )
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as any).code === 404
    )
      return
    throw error
  }
}
