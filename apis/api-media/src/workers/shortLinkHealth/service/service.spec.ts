import { type MockedFunction, vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'
import { buildShortLinkWithDomain } from '../../../../test/shortLinkFixtures'
import { slackChatPostMessage } from '../../../lib/slack'
import { publishLink } from '../../../schema/shortLink/edge'

import { checkDestination } from './checkDestination'
import { service } from './service'

vi.mock('./checkDestination', () => ({ checkDestination: vi.fn() }))
vi.mock('../../../schema/shortLink/edge', () => ({ publishLink: vi.fn() }))
vi.mock('../../../lib/slack', () => ({ slackChatPostMessage: vi.fn() }))

const checkDestinationMock = checkDestination as MockedFunction<
  typeof checkDestination
>
const publishLinkMock = publishLink as MockedFunction<typeof publishLink>
const slackMock = slackChatPostMessage as MockedFunction<
  typeof slackChatPostMessage
>

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as import('pino').Logger

describe('shortLinkHealth/service', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      SLACK_SHORT_LINKS_BOT_TOKEN: 'token',
      SLACK_SHORT_LINKS_CHANNEL_ID: 'channel'
    }
    prismaMock.shortLink.update.mockResolvedValue(buildShortLinkWithDomain())
    prismaMock.$transaction.mockImplementation(
      async (fn: (tx: typeof prismaMock) => Promise<unknown>) =>
        await fn(prismaMock)
    )
    publishLinkMock.mockResolvedValue(new Date())
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('checks active links that redirect to a plain URL and records the result', async () => {
    const link = buildShortLinkWithDomain({
      id: 'l1',
      to: 'https://ok.example'
    })
    prismaMock.shortLink.findMany.mockResolvedValueOnce([link])
    checkDestinationMock.mockResolvedValue('ok')

    await service(logger)

    expect(prismaMock.shortLink.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { status: 'active' },
            { status: 'paused', pausedByHealthCheckAt: { not: null } }
          ],
          deletedAt: null,
          AND: [{ OR: [{ brightcoveId: null }, { redirectType: null }] }]
        },
        include: { domain: true }
      })
    )
    expect(checkDestinationMock).toHaveBeenCalledWith('https://ok.example')
    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { healthStatus: 'ok', healthCheckedAt: expect.any(Date) }
    })
    expect(publishLinkMock).not.toHaveBeenCalled()
    expect(slackMock).not.toHaveBeenCalled()
  })

  it('alerts Slack about a newly failing link without failover', async () => {
    const link = buildShortLinkWithDomain({
      id: 'l1',
      name: 'Launch',
      to: 'https://gone.example',
      healthStatus: 'ok'
    })
    prismaMock.shortLink.findMany.mockResolvedValueOnce([link])
    checkDestinationMock.mockResolvedValue('notFound')

    await service(logger)

    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { healthStatus: 'notFound', healthCheckedAt: expect.any(Date) }
    })
    expect(publishLinkMock).not.toHaveBeenCalled()
    expect(slackMock).toHaveBeenCalledTimes(1)
    expect(slackMock.mock.calls[0][0]).toMatchObject({
      config: { token: 'token', channelId: 'channel' },
      body: { text: expect.stringContaining('https://example.com/testPath') }
    })
    expect(slackMock.mock.calls[0][0].body.text).toContain('notFound')
    expect(slackMock.mock.calls[0][0].body.text).toContain(
      'none (auto failover'
    )
  })

  it('prints the short URL with the domain path prefix', async () => {
    prismaMock.shortLink.findMany.mockResolvedValueOnce([
      buildShortLinkWithDomain(
        { id: 'l1', pathname: 'easter', healthStatus: 'ok' },
        { hostname: 'jesus.film', pathPrefix: 's' }
      )
    ])
    checkDestinationMock.mockResolvedValue('notFound')

    await service(logger)

    expect(slackMock.mock.calls[0][0].body.text).toContain(
      'https://jesus.film/s/easter'
    )
  })

  it('does not re-alert a link that was already failing', async () => {
    prismaMock.shortLink.findMany.mockResolvedValueOnce([
      buildShortLinkWithDomain({ id: 'l1', healthStatus: 'serverError' })
    ])
    checkDestinationMock.mockResolvedValue('serverError')

    await service(logger)

    expect(slackMock).not.toHaveBeenCalled()
  })

  it('pauses and republishes a link failing for the second time when the domain opts into failover', async () => {
    const link = buildShortLinkWithDomain(
      { id: 'l1', to: 'https://down.example', healthStatus: 'timeout' },
      { autoFailover: true, fallbackTo: 'https://fallback.example' }
    )
    prismaMock.shortLink.findMany.mockResolvedValueOnce([link])
    checkDestinationMock.mockResolvedValue('serverError')

    await service(logger)

    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: {
        healthStatus: 'serverError',
        healthCheckedAt: expect.any(Date),
        status: 'paused',
        pausedByHealthCheckAt: expect.any(Date)
      }
    })
    expect(publishLinkMock).toHaveBeenCalledWith('l1', prismaMock, logger)
    // already failing last hour: no new alert
    expect(slackMock).not.toHaveBeenCalled()
  })

  it('does not fail over on the first failing check', async () => {
    const link = buildShortLinkWithDomain(
      { id: 'l1', to: 'https://down.example', healthStatus: 'ok' },
      { autoFailover: true, fallbackTo: 'https://fallback.example' }
    )
    prismaMock.shortLink.findMany.mockResolvedValueOnce([link])
    checkDestinationMock.mockResolvedValue('serverError')

    await service(logger)

    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { healthStatus: 'serverError', healthCheckedAt: expect.any(Date) }
    })
    expect(publishLinkMock).not.toHaveBeenCalled()
    expect(slackMock.mock.calls[0][0].body.text).toContain(
      '*Action*: none'
    )
  })

  it('resumes a link it paused once the destination is healthy again', async () => {
    const link = buildShortLinkWithDomain(
      {
        id: 'l1',
        status: 'paused',
        healthStatus: 'serverError',
        pausedByHealthCheckAt: new Date('2026-10-01T00:00:00Z')
      },
      { autoFailover: true, fallbackTo: 'https://fallback.example' }
    )
    prismaMock.shortLink.findMany.mockResolvedValueOnce([link])
    checkDestinationMock.mockResolvedValue('ok')

    await service(logger)

    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: {
        healthStatus: 'ok',
        healthCheckedAt: expect.any(Date),
        status: 'active',
        pausedByHealthCheckAt: null
      }
    })
    expect(publishLinkMock).toHaveBeenCalledWith('l1', prismaMock, logger)
  })

  it('leaves a link a person paused alone even when its destination is healthy', async () => {
    const link = buildShortLinkWithDomain({
      id: 'l1',
      status: 'paused',
      pausedByHealthCheckAt: null
    })
    prismaMock.shortLink.findMany.mockResolvedValueOnce([link])
    checkDestinationMock.mockResolvedValue('ok')

    await service(logger)

    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { healthStatus: 'ok', healthCheckedAt: expect.any(Date) }
    })
    expect(publishLinkMock).not.toHaveBeenCalled()
  })

  it('keeps checking the batch when one link fails to publish', async () => {
    prismaMock.shortLink.findMany.mockResolvedValueOnce([
      buildShortLinkWithDomain(
        { id: 'l1', healthStatus: 'timeout' },
        { autoFailover: true, fallbackTo: 'https://fallback.example' }
      ),
      buildShortLinkWithDomain({ id: 'l2', to: 'https://ok.example' })
    ])
    checkDestinationMock
      .mockResolvedValueOnce('timeout')
      .mockResolvedValueOnce('ok')
    publishLinkMock.mockRejectedValueOnce(new Error('KV down'))

    await service(logger)

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ shortLinkId: 'l1' }),
      'short link health check failed for this link'
    )
    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l2' },
      data: { healthStatus: 'ok', healthCheckedAt: expect.any(Date) }
    })
  })

  it('never fails over a videoEmbedded link', async () => {
    prismaMock.shortLink.findMany.mockResolvedValueOnce([
      buildShortLinkWithDomain(
        { id: 'l1', assetClass: 'videoEmbedded' },
        { autoFailover: true, fallbackTo: 'https://fallback.example' }
      )
    ])
    checkDestinationMock.mockResolvedValue('timeout')

    await service(logger)

    expect(prismaMock.shortLink.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { healthStatus: 'timeout', healthCheckedAt: expect.any(Date) }
    })
    expect(publishLinkMock).not.toHaveBeenCalled()
  })

  it('does not fail over without an effective fallback', async () => {
    prismaMock.shortLink.findMany.mockResolvedValueOnce([
      buildShortLinkWithDomain({ id: 'l1' }, { autoFailover: true })
    ])
    checkDestinationMock.mockResolvedValue('dns')

    await service(logger)

    expect(publishLinkMock).not.toHaveBeenCalled()
  })

  it('skips Slack silently when the env is unset', async () => {
    delete process.env.SLACK_SHORT_LINKS_BOT_TOKEN
    prismaMock.shortLink.findMany.mockResolvedValueOnce([
      buildShortLinkWithDomain({ id: 'l1' })
    ])
    checkDestinationMock.mockResolvedValue('notFound')

    await service(logger)

    expect(slackMock).not.toHaveBeenCalled()
    expect(prismaMock.shortLink.update).toHaveBeenCalledTimes(1)
  })

  it('pages through links with a cursor', async () => {
    const page = Array.from({ length: 100 }, (_, index) =>
      buildShortLinkWithDomain({ id: `l${index}` })
    )
    prismaMock.shortLink.findMany
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce([buildShortLinkWithDomain({ id: 'last' })])
    checkDestinationMock.mockResolvedValue('ok')

    await service(logger)

    expect(prismaMock.shortLink.findMany).toHaveBeenCalledTimes(2)
    expect(prismaMock.shortLink.findMany.mock.calls[1][0]).toMatchObject({
      cursor: { id: 'l99' },
      skip: 1
    })
    expect(prismaMock.shortLink.update).toHaveBeenCalledTimes(101)
  })
})
