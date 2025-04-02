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

  const cleanup: Array<() => void> = []

  try {
    const credentials = {
      token: process.env.CROWDIN_API_KEY
    }

    const { stringTranslationsApi, sourceStringsApi } = new crowdin(credentials)

    // Execute imports sequentially and collect cleanup functions
    cleanup.push(
      await importVideoTitles(sourceStringsApi, stringTranslationsApi, logger)
    )
    cleanup.push(
      await importVideoDescriptions(
        sourceStringsApi,
        stringTranslationsApi,
        logger
      )
    )
    cleanup.push(
      await importStudyQuestions(
        sourceStringsApi,
        stringTranslationsApi,
        logger
      )
    )
    cleanup.push(
      await importBibleBooks(sourceStringsApi, stringTranslationsApi, logger)
    )
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
  } finally {
    logger?.info('Running cleanup functions...')
    for (let i = cleanup.length - 1; i >= 0; i--) {
      try {
        cleanup[i]()
      } catch (cleanupError) {
        logger?.error({ error: cleanupError }, `Error during cleanup step ${i}`)
      }
    }
  }
}
