import { SourceStringsModel } from '@crowdin/crowdin-api-client'
import { StringTranslationsModel } from '@crowdin/crowdin-api-client/out/stringTranslations'

export interface CrowdinApiErrorData {
  message: string
  code?: number
  fileId?: number
  languageCode?: string
}

export type CrowdinApiError = Error & CrowdinApiErrorData

export function createCrowdinApiError(
  message: string,
  code?: number,
  fileId?: number,
  languageCode?: string
): CrowdinApiError {
  const error = new Error(message) as CrowdinApiError
  error.name = 'CrowdinApiError'
  error.code = code
  error.fileId = fileId
  error.languageCode = languageCode
  return error
}

export function handleCrowdinError(
  error: unknown,
  fileId?: number,
  languageCode?: string
): never {
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

export type CrowdinTranslation =
  StringTranslationsModel.PlainLanguageTranslation

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

export interface CrowdinError {
  fileId: number
  languageCode?: string
  message: string
  code?: number
}

export interface ProcessedTranslation {
  identifier: string
  text: string
  context: string
  languageId: string
}
