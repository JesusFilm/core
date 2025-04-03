import { SourceStrings, StringTranslations } from '@crowdin/crowdin-api-client'
import { SourceStringsModel } from '@crowdin/crowdin-api-client/out/sourceStrings'
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

export interface CrowdinError {
  fileId: number
  languageCode?: string
  message: string
  code?: number
}

export interface CrowdinApis {
  sourceStrings: SourceStrings
  stringTranslations: StringTranslations
}

export interface ProcessedTranslation {
  sourceString: SourceStringsModel.String
  translation: CrowdinTranslation
  languageCode: string
}
