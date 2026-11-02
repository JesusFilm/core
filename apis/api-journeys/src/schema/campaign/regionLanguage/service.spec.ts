import { mockQueueAdd } from '../../../../test/bullmqMock'
import { prismaMock } from '../../../../test/prismaMock'
import {
  createShortLink,
  deleteShortLink,
  getTo
} from '../../qrCode/qrCode.service'

import { createRegionLanguageQrCode } from './service'

vi.mock('../../qrCode/qrCode.service', () => ({
  createShortLink: vi.fn(),
  deleteShortLink: vi.fn(),
  updateShortLink: vi.fn(),
  getShortLinkDomain: vi.fn(() => 'short.example.org'),
  getTo: vi.fn()
}))

describe('createRegionLanguageQrCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getTo).mockResolvedValue('https://example.com/christmas-europe')
    prismaMock.qrCode.create.mockImplementation((async ({
      data
    }: {
      data: Record<string, unknown>
    }) => ({
      id: 'qrCodeId',
      ...data
    })) as never)
    vi.mocked(createShortLink).mockImplementation(async ({ id }) => ({
      id,
      shortUrl: `https://short.example.org/${id}`
    }))
  })

  /** Link a journey as the Share Language mutation does: the step applied last in the transaction. */
  async function link(): Promise<void> {
    const { step } = await createRegionLanguageQrCode(
      prismaMock,
      'teamId',
      'journeyId'
    )
    await step.apply()
  }

  it("saves the short link's address on the QR row inside the transaction once the link exists", async () => {
    await link()

    const { id: shortLinkId } = vi.mocked(createShortLink).mock.calls[0][0]
    expect(prismaMock.qrCode.update).toHaveBeenCalledWith({
      where: { id: 'qrCodeId' },
      data: { shortLinkUrl: `https://short.example.org/${shortLinkId}` }
    })
    expect(vi.mocked(createShortLink).mock.invocationCallOrder[0]).toBeLessThan(
      prismaMock.qrCode.update.mock.invocationCallOrder[0]
    )
    expect(deleteShortLink).not.toHaveBeenCalled()
  })

  it('saves a null address when api-media returns no link', async () => {
    vi.mocked(createShortLink).mockResolvedValue({
      id: 'shortLinkId',
      shortUrl: null
    })

    await link()

    expect(prismaMock.qrCode.update).toHaveBeenCalledWith({
      where: { id: 'qrCodeId' },
      data: { shortLinkUrl: null }
    })
  })

  it('rolls back and queues the delete of the new short link when saving its address fails', async () => {
    prismaMock.qrCode.update.mockRejectedValue(new Error('write failed'))

    await expect(link()).rejects.toThrow('write failed')

    const { id: shortLinkId } = vi.mocked(createShortLink).mock.calls[0][0]
    expect(mockQueueAdd).toHaveBeenCalledTimes(1)
    expect(mockQueueAdd).toHaveBeenCalledWith(
      'api-journeys-shortlink-delete-job',
      { shortLinkId },
      expect.objectContaining({ attempts: 5 })
    )
    expect(deleteShortLink).not.toHaveBeenCalled()
  })

  it('leaves nothing to revert when the short-link create fails', async () => {
    vi.mocked(createShortLink).mockRejectedValue(new Error('gateway down'))

    await expect(link()).rejects.toThrow('gateway down')

    expect(prismaMock.qrCode.update).not.toHaveBeenCalled()
    expect(deleteShortLink).not.toHaveBeenCalled()
  })
})
