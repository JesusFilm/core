import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { logger } from '../../logger'
import { slackChatPostMessage } from '../slack/chatPostMessage'
import { getMediaDataLangSlackConfig } from '../slack/config'

// Slack rejects section text over 3000 characters (and slackChatPostMessage
// swallows the error), so keep each listed group comfortably under that.
const maxRowsPerGroup = 15
const maxSectionChars = 2900

export interface EmptyContainerVideo {
  id: string
  slug: string | null
  label: string
}

export interface SeriesWithoutCollectionParentVideo
  extends EmptyContainerVideo {
  parentId: string
  parentLabel: string
}

export interface VideoLabelInconsistencies {
  /** `series` or `collection` videos with no children. */
  emptyContainers: EmptyContainerVideo[]
  /** `series` videos with a parent that is not a `collection`. */
  seriesWithoutCollectionParent: SeriesWithoutCollectionParentVideo[]
}

/**
 * Read-only. Nothing in here writes to the database, and nothing fixes what
 * it finds: the Video.label column is set verbatim from input, so a person has
 * to decide what the right label is.
 */
export async function findVideoLabelInconsistencies(): Promise<VideoLabelInconsistencies> {
  // childIds and the `children` relation are both written on videoUpdate. Require
  // both to be empty so drift between them never raises a false alarm.
  const emptyContainers = await prisma.video.findMany({
    where: {
      label: { in: ['series', 'collection'] },
      childIds: { isEmpty: true },
      children: { none: {} }
    },
    select: { id: true, slug: true, label: true },
    orderBy: { id: 'asc' }
  })

  const seriesWithOtherParents = await prisma.video.findMany({
    where: {
      label: 'series',
      parents: { some: { label: { not: 'collection' } } }
    },
    select: {
      id: true,
      slug: true,
      label: true,
      parents: { select: { id: true, label: true } }
    },
    orderBy: { id: 'asc' }
  })

  const seriesWithoutCollectionParent = seriesWithOtherParents.flatMap(
    ({ parents, ...video }) =>
      parents
        .filter((parent) => parent.label !== 'collection')
        .map((parent) => ({
          ...video,
          parentId: parent.id,
          parentLabel: parent.label
        }))
  )

  return { emptyContainers, seriesWithoutCollectionParent }
}

function formatRows(
  rows: string[],
  heading: string
): { type: 'section'; text: { type: 'mrkdwn'; text: string } } | undefined {
  if (rows.length === 0) return undefined

  const buildText = (shown: string[], omitted: number): string => {
    const lines = omitted > 0 ? [...shown, `…and ${omitted} more`] : shown
    return `*${heading} (${rows.length})*\n${lines.join('\n')}`
  }

  // Row count alone doesn't bound the text length: ids or slugs can be
  // arbitrarily long, so drop rows until the rendered section actually
  // fits Slack's limit, keeping the omission count accurate.
  let shown = rows.slice(0, maxRowsPerGroup)
  let omitted = rows.length - shown.length
  while (
    shown.length > 0 &&
    buildText(shown, omitted).length > maxSectionChars
  ) {
    shown = shown.slice(0, -1)
    omitted = rows.length - shown.length
  }

  return {
    type: 'section',
    text: { type: 'mrkdwn', text: buildText(shown, omitted) }
  }
}

export async function sendVideoLabelConsistencyAlert(
  currentLogger: Logger = logger
): Promise<void> {
  const childLogger = currentLogger.child({ report: 'video-label-consistency' })
  const { emptyContainers, seriesWithoutCollectionParent } =
    await findVideoLabelInconsistencies()
  const total = emptyContainers.length + seriesWithoutCollectionParent.length

  if (total === 0) {
    childLogger.info('Video label consistency check found no inconsistencies')
    return
  }

  const config = getMediaDataLangSlackConfig(childLogger)
  if (config == null) return

  const text = `${total} video label ${total === 1 ? 'inconsistency' : 'inconsistencies'} found`
  const groups = [
    formatRows(
      emptyContainers.map(
        ({ id, slug, label }) => `• \`${id}\` (${slug ?? 'no slug'}): ${label}`
      ),
      'Series or collection with no children'
    ),
    formatRows(
      seriesWithoutCollectionParent.map(
        ({ id, slug, parentId, parentLabel }) =>
          `• \`${id}\` (${slug ?? 'no slug'}): series under \`${parentId}\` (${parentLabel})`
      ),
      'Series whose parent is not a collection'
    )
  ].filter((group) => group != null)

  await slackChatPostMessage({
    config,
    body: {
      text,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: 'Video label check', emoji: true }
        },
        { type: 'section', text: { type: 'mrkdwn', text } },
        ...groups
      ]
    },
    log: childLogger,
    failureMessage: 'Video label consistency Slack alert failed',
    errorMessage: 'Video label consistency Slack alert threw an error'
  })
}
