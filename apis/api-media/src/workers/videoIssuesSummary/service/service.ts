import { Logger } from 'pino'

import {
  computeAlgoliaVariantDrift,
  computeAlgoliaVideoDrift,
  computeAvailableLanguagesIssues,
  computeUploadStateIssues
} from '../../../schema/videoIssueChecks/videoIssueChecks'

// Logs a daily summary of video issue counts. Once the Slack helper lands on
// main (see vmt-38), swap the `logger.info` for a `chatPostMessage` call.
export async function service(logger?: Logger): Promise<void> {
  logger?.info('video issues summary started')

  const [
    availableLanguages,
    algoliaVideoDrift,
    algoliaVariantDrift,
    uploadState
  ] = await Promise.all([
    computeAvailableLanguagesIssues(),
    computeAlgoliaVideoDrift(),
    computeAlgoliaVariantDrift(),
    computeUploadStateIssues()
  ])

  logger?.info(
    {
      counts: {
        availableLanguages: availableLanguages.length,
        algoliaVideoDrift: algoliaVideoDrift.length,
        algoliaVariantDrift: algoliaVariantDrift.length,
        uploadState: uploadState.length
      }
    },
    'video issues summary'
  )
}
