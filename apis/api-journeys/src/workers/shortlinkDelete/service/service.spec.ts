import { Job } from 'bullmq'

import { deleteShortLink } from '../../../schema/qrCode/qrCode.service'

import { ShortLinkDeleteJob, service } from './service'

vi.mock('../../../schema/qrCode/qrCode.service', () => ({
  deleteShortLink: vi.fn()
}))

const mockDeleteShortLink = vi.mocked(deleteShortLink)

describe('shortlinkDelete service', () => {
  const job = {
    data: { shortLinkId: 'shortLinkId' }
  } as Job<ShortLinkDeleteJob>

  beforeEach(() => {
    mockDeleteShortLink.mockReset()
  })

  it('deletes the short link of the job', async () => {
    mockDeleteShortLink.mockResolvedValueOnce(undefined)

    await service(job)

    expect(mockDeleteShortLink).toHaveBeenCalledWith('shortLinkId')
  })

  it('rejects when the delete fails, so BullMQ retries the job', async () => {
    mockDeleteShortLink.mockRejectedValueOnce(new Error('gateway down'))

    await expect(service(job)).rejects.toThrow('gateway down')
  })
})
