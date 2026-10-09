import { Logger } from 'pino'

import {
  ShortLink,
  ShortLinkDomain,
  ShortLinkHealth,
  prisma
} from '@core/prisma/media/client'

import { slackChatPostMessage } from '../../../lib/slack'
import type { SlackBotChannelConfig } from '../../../lib/slack'
import { publishLink } from '../../../schema/shortLink/edge'
import { buildShortUrl } from '../../../schema/shortLink/lib/shortUrl'
import { logger as defaultLogger } from '../../lib/logger'

import { checkDestination } from './checkDestination'
import { readShortLinksEnv } from '../../../schema/shortLink/lib/env'

const BATCH_SIZE = 100
const CONCURRENCY = 10

type LinkWithDomain = ShortLink & { domain: ShortLinkDomain }

interface CheckOutcome {
  link: LinkWithDomain
  previous: ShortLinkHealth | null
  health: ShortLinkHealth
  pausedByFailover: boolean
}

/** Alerts are optional: without both env vars the check runs silently. */
function getShortLinksSlackConfig(): SlackBotChannelConfig | null {
  const { SLACK_SHORT_LINKS_BOT_TOKEN: token, SLACK_SHORT_LINKS_CHANNEL_ID: channelId } =
    readShortLinksEnv()
  if (token == null || channelId == null)
    return null
  return { token, channelId }
}

function effectiveFallbackTo(link: LinkWithDomain): string | null {
  return link.fallbackTo ?? link.domain.fallbackTo
}

function shouldFailOver(
  link: LinkWithDomain,
  health: ShortLinkHealth
): boolean {
  return (
    health !== 'ok' &&
    link.domain.autoFailover &&
    link.assetClass !== 'videoEmbedded' &&
    effectiveFallbackTo(link) != null
  )
}

async function checkLink(
  link: LinkWithDomain,
  logger: Logger
): Promise<CheckOutcome> {
  const health = await checkDestination(link.to)
  const pausedByFailover = shouldFailOver(link, health)

  await prisma.shortLink.update({
    where: { id: link.id },
    data: {
      healthStatus: health,
      healthCheckedAt: new Date(),
      ...(pausedByFailover ? { status: 'paused' } : {})
    }
  })
  if (pausedByFailover) {
    await publishLink(link.id, prisma, logger)
    logger.warn(
      { shortLinkId: link.id, hostname: link.domain.hostname, health },
      'short link paused by health-check failover'
    )
  }

  return { link, previous: link.healthStatus, health, pausedByFailover }
}

async function alertNewlyFailing(
  outcomes: CheckOutcome[],
  slackConfig: SlackBotChannelConfig | null,
  logger: Logger
): Promise<void> {
  const newlyFailing = outcomes.filter(
    ({ previous, health }) =>
      health !== 'ok' && (previous == null || previous === 'ok')
  )
  if (newlyFailing.length === 0 || slackConfig == null) return

  for (const { link, health, pausedByFailover } of newlyFailing) {
    const shortUrl = buildShortUrl(link.domain, link.pathname)
    const lines = [
      `:warning: Short link destination failing (${health})`,
      `*Short link*: ${shortUrl}${link.name != null ? ` (${link.name})` : ''}`,
      `*Destination*: ${link.to}`,
      `*Asset class*: ${link.assetClass}`,
      pausedByFailover
        ? `*Action*: paused, traffic now goes to ${effectiveFallbackTo(link) ?? '(none)'}`
        : '*Action*: none (auto failover off or no fallback)'
    ]
    await slackChatPostMessage({
      config: slackConfig,
      body: { text: lines.join('\n') },
      log: logger,
      failureMessage: 'short link health: Slack alert rejected',
      errorMessage: 'short link health: Slack alert failed'
    })
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  for (let index = 0; index < items.length; index += limit) {
    const batch = items.slice(index, index + limit)
    results.push(...(await Promise.all(batch.map(fn))))
  }
  return results
}

/**
 * Hourly destination health check: HEAD (then GET) every active link that
 * redirects to a plain URL, record the result, pause failing links on domains
 * that opted into failover (never videoEmbedded), and alert Slack about links
 * that just started failing.
 */
export async function service(logger: Logger = defaultLogger): Promise<void> {
  const slackConfig = getShortLinksSlackConfig()
  if (slackConfig == null)
    logger.debug(
      'SLACK_SHORT_LINKS_BOT_TOKEN or SLACK_SHORT_LINKS_CHANNEL_ID unset; health alerts disabled'
    )

  let cursor: string | undefined
  let checked = 0
  let failing = 0
  while (true) {
    const links = await prisma.shortLink.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        // Brightcove redirects resolve through the Arclight API, not `to`
        OR: [{ brightcoveId: null }, { redirectType: null }]
      },
      include: { domain: true },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor != null ? { cursor: { id: cursor }, skip: 1 } : {})
    })
    if (links.length === 0) break

    const outcomes = await mapWithConcurrency(links, CONCURRENCY, (link) =>
      checkLink(link, logger)
    )
    await alertNewlyFailing(outcomes, slackConfig, logger)

    checked += outcomes.length
    failing += outcomes.filter(({ health }) => health !== 'ok').length
    cursor = links[links.length - 1].id
    if (links.length < BATCH_SIZE) break
  }

  logger.info({ checked, failing }, 'short link health check complete')
}
