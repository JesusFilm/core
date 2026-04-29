import { Logger } from 'pino'

import { logger } from '../logger'

import {
  postEmptyWeeklyVideoSlackMessage,
  postWeeklyVideoSlackMessages
} from './videoSlackRenderer'
import {
  WeeklyVideoSummaryOptions,
  formatDateIso,
  isValidWeeklyVideoSummaryWindow,
  loadWeeklyVideoReport,
  resolveWeeklyVideoSummaryWindow
} from './videoSlackReport'

export async function sendWeeklyVideoSummary(
  currentDate = new Date(),
  currentLogger: Logger = logger,
  options: WeeklyVideoSummaryOptions = {}
): Promise<void> {
  const childLogger = currentLogger.child({
    report: 'weekly-video-summary'
  })

  try {
    const { startDate, endDate } = resolveWeeklyVideoSummaryWindow({
      currentDate,
      options
    })

    if (!isValidWeeklyVideoSummaryWindow({ startDate, endDate })) {
      childLogger.warn(
        {
          windowStart: formatDateIso(startDate),
          windowEnd: formatDateIso(endDate)
        },
        'Weekly video Slack summary skipped: startDate is after endDate'
      )
      return
    }

    const { rows, counts } = await loadWeeklyVideoReport({
      startDate,
      endDate
    })

    if (
      counts.newVideos === 0 &&
      counts.variantUpdateRows === 0 &&
      counts.videoMetadataOnlyRows === 0
    ) {
      childLogger.info(
        {
          windowStart: formatDateIso(startDate),
          windowEnd: formatDateIso(endDate),
          newVideos: counts.newVideos,
          variantUpdateRows: counts.variantUpdateRows,
          videoMetadataOnlyRows: counts.videoMetadataOnlyRows
        },
        'Weekly video Slack summary: posting empty-week message — no new videos, no variant updates, and no metadata-only video updates in the window'
      )
      await postEmptyWeeklyVideoSlackMessage({
        startDate,
        endDate,
        childLogger
      })
      return
    }

    await postWeeklyVideoSlackMessages({
      rows,
      startDate,
      endDate,
      childLogger
    })
  } catch (error) {
    childLogger.warn(
      {
        error
      },
      'Weekly video Slack summary threw an error'
    )
  }
}
