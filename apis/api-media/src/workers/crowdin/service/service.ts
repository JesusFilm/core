import crowdin, {
  CrowdinError,
  CrowdinValidationError
} from '@crowdin/crowdin-api-client'
import { Logger } from 'pino'

import {
  importBibleBooks,
  importStudyQuestions,
  importVideoDescriptions,
  importVideoTitles
} from '../importers'

export async function service(logger?: Logger): Promise<void> {
  logger?.info('🚀 Starting Crowdin translation import...')

  if (!process.env.CROWDIN_API_KEY) {
    throw new Error('Crowdin API key not set')
  }

  try {
    const credentials = {
      token: process.env.CROWDIN_API_KEY
    }

    const { stringTranslationsApi, sourceStringsApi } = new crowdin(credentials)

    const cleanup = [
      await importVideoTitles(sourceStringsApi, stringTranslationsApi, logger),
      await importVideoDescriptions(
        sourceStringsApi,
        stringTranslationsApi,
        logger
      ),
      await importStudyQuestions(
        sourceStringsApi,
        stringTranslationsApi,
        logger
      ),
      await importBibleBooks(sourceStringsApi, stringTranslationsApi, logger)
    ]

    cleanup.forEach((fn) => fn())
  } catch (error: unknown) {
    if (error instanceof CrowdinValidationError) {
      logger?.error({ error: error.message }, 'Validation error')
    } else if (error instanceof CrowdinError) {
      logger?.error(
        { error: error.message, code: error.code },
        'Crowdin API error'
      )
    } else if (error instanceof Error) {
      logger?.error({ error: error.message }, 'Unexpected error')
    } else {
      logger?.error({ error }, 'Unexpected error')
    }
    throw error
  }
}
