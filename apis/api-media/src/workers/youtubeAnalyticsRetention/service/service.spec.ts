import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as import('pino').Logger

describe('youtubeAnalyticsRetention/service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ now: new Date('2026-11-19T03:00:00Z') })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deletes every day fetched 28 or more days ago', async () => {
    prismaMock.youtubeChannelAnalyticsDay.deleteMany.mockResolvedValue({
      count: 3
    })

    await service(logger)

    expect(
      prismaMock.youtubeChannelAnalyticsDay.deleteMany
    ).toHaveBeenCalledWith({
      where: { fetchedAt: { lte: new Date('2026-10-22T03:00:00Z') } }
    })
    expect(logger.info).toHaveBeenCalledWith(
      { deleted: 3, cutoff: '2026-10-22T03:00:00.000Z' },
      expect.any(String)
    )
  })
})
