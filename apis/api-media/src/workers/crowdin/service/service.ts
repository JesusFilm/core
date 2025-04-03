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
    // Run all imports
    await importVideoTitles()
    await importVideoDescriptions()
    await importStudyQuestions()
    await importBibleBooks()

    logger?.info('✅ Crowdin translation import completed')
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
