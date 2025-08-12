import crowdinClient, {
  SourceStrings,
  StringTranslations
} from '@crowdin/crowdin-api-client'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
import { Logger } from 'pino'

import { LANGUAGE_CODES } from './config'
import {
  ArclightFile,
  CrowdinApis,
  CrowdinError,
  CrowdinTranslation,
  ProcessedTranslation,
  createCrowdinApiError,
  handleCrowdinError
} from './types'

export const client = new crowdinClient({
  token: process.env.CROWDIN_API_KEY ?? ''
})

export const apis: CrowdinApis = {
  sourceStrings: client.sourceStringsApi,
  stringTranslations: client.stringTranslationsApi
}

export const getCrowdinProjectId = (): number => {
  if (!process.env.CROWDIN_PROJECT_ID) {
    throw new Error('CROWDIN_PROJECT_ID is not set')
  }
  const envValue = process.env.CROWDIN_PROJECT_ID
  const parsed = Number(envValue ?? 0)
  return parsed
}

export async function processFile(
  file: ArclightFile,
  importOne: (data: ProcessedTranslation) => Promise<void>,
  parentLogger?: Logger
): Promise<void> {
  const logger = parentLogger?.child({
    file: file.name.replace('.csv', '')
  })

  logger?.info('file import started for file: ' + file.name)
  const errors: CrowdinError[] = []

  try {
    const sourceStrings = await fetchSourceStrings(file.id, apis.sourceStrings)
    if (sourceStrings.length === 0) {
      logger?.info('no source strings found for file: ' + file.name)
      return
    }

    const sourceStringMap = new Map(sourceStrings.map((str) => [str.id, str]))
    let page = 0

    for (const [languageCode, languageId] of Object.entries(LANGUAGE_CODES)) {
      try {
        const translations = await fetchTranslations(
          languageCode,
          file.id,
          apis.stringTranslations
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

        const validTranslations = translations
          .map((translation) => {
            const sourceString = sourceStringMap.get(translation.stringId)
            if (!sourceString) return null

            return {
              identifier: sourceString.identifier,
              text: translation.text,
              context: sourceString.context,
              languageId
            }
          })
          .filter((data): data is ProcessedTranslation => data !== null)

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
  api: SourceStrings
): Promise<Array<SourceStringsModel.String>> {
  try {
    return await fetchPaginatedData(
      (offset, limit) =>
        api.listProjectStrings(getCrowdinProjectId(), {
          fileId,
          limit,
          offset
        }),
      500
    )
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
    const translations = await fetchPaginatedData(
      (offset, limit) =>
        api.listLanguageTranslations(getCrowdinProjectId(), languageCode, {
          fileId,
          limit,
          offset
        }),
      500
    )

    // Filter out non-plain text translations
    return translations.filter(
      (translation): translation is CrowdinTranslation =>
        translation.contentType === 'text/plain'
    )
  } catch (error) {
    handleCrowdinError(error, fileId, languageCode)
  }
}
