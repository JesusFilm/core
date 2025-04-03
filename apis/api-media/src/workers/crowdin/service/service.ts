import crowdin from '@crowdin/crowdin-api-client'
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

    // Run all cleanup functions
    logger?.info('Running cleanup functions...')
    cleanup.forEach((fn) => fn?.())
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'CrowdinValidationError') {
        logger?.error({ error: error.message }, 'Validation error')
      } else if (error.name === 'CrowdinError' && 'code' in error) {
        logger?.error(
          { error: error.message, code: (error as { code: number }).code },
          'Crowdin API error'
        )
      } else {
        logger?.error({ error: error.message }, 'Unexpected error')
      }
    } else {
      logger?.error({ error }, 'Unexpected error')
    }
    throw error
  }
}
