import { Logger } from 'pino'

import { logger } from '../../logger'

import {
  type VideoSlackReportProfile,
  dataLangVideoSlackProfile,
  productionManagerVideoSlackProfile
} from './videoSlackProfiles'
import { postVideoSlackMessages } from './videoSlackRenderer'
import {
  VideoSlackSummaryOptions,
  formatDateIso,
  isValidVideoSlackSummaryWindow,
  loadVideoSlackReport,
  resolveVideoSlackSummaryWindow
} from './videoSlackReport'

export async function sendVideoSlackSummary(
  profile: VideoSlackReportProfile,
  currentDate = new Date(),
  currentLogger: Logger = logger,
  options: VideoSlackSummaryOptions = {}
): Promise<void> {
  const childLogger = currentLogger.child({ report: profile.loggerName })

  try {
    const { startDate, endDate } = resolveVideoSlackSummaryWindow({
      currentDate,
      options
    })

    if (!isValidVideoSlackSummaryWindow({ startDate, endDate })) {
      childLogger.warn(
        {
          windowStart: formatDateIso(startDate),
          windowEnd: formatDateIso(endDate)
        },
        profile.title + ' Slack summary skipped: startDate is after endDate'
      )
      return
    }

    const { rows, counts } = await loadVideoSlackReport({
      startDate,
      endDate,
      videoFilter: profile.videoFilter
    })

    if (rows.length === 0) {
      childLogger.info(
        {
          windowStart: formatDateIso(startDate),
          windowEnd: formatDateIso(endDate),
          variants: counts.variants,
          renderedRows: rows.length
        },
        profile.title +
          ' Slack summary skipped: no rows to render in delayed window'
      )
      return
    }

    await postVideoSlackMessages({
      profile,
      rows,
      startDate,
      endDate,
      childLogger
    })
  } catch (error) {
    childLogger.warn({ error }, profile.title + ' Slack summary threw an error')
    if (options.throwOnError === true) {
      throw error
    }
  }
}

export async function sendDataLangVideoSummary(
  currentDate = new Date(),
  currentLogger: Logger = logger,
  options: VideoSlackSummaryOptions = {}
): Promise<void> {
  await sendVideoSlackSummary(
    dataLangVideoSlackProfile,
    currentDate,
    currentLogger,
    options
  )
}

export async function sendProductionManagerFlagshipSummary(
  currentDate = new Date(),
  currentLogger: Logger = logger,
  options: VideoSlackSummaryOptions = {}
): Promise<void> {
  await sendVideoSlackSummary(
    productionManagerVideoSlackProfile,
    currentDate,
    currentLogger,
    options
  )
}
