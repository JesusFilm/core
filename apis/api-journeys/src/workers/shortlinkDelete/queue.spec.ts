import { mockQueueAdd } from '../../../test/bullmqMock'
import { deleteShortLink } from '../../schema/qrCode/qrCode.service'

import { enqueueShortLinkDeletes } from './queue'

vi.mock('../../schema/qrCode/qrCode.service', () => ({
  deleteShortLink: vi.fn()
}))

const mockDeleteShortLink = vi.mocked(deleteShortLink)

describe('enqueueShortLinkDeletes', () => {
  beforeEach(() => {
    mockDeleteShortLink.mockReset()
  })

  it('adds one retried job per short link id', async () => {
    await enqueueShortLinkDeletes(['a', 'b'])

    const options = {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: { age: 86_400 }
    }
    expect(mockQueueAdd.mock.calls).toEqual([
      [
        'api-journeys-shortlink-delete-job',
        { shortLinkId: 'a' },
        { ...options, jobId: 'shortlink-delete-a' }
      ],
      [
        'api-journeys-shortlink-delete-job',
        { shortLinkId: 'b' },
        { ...options, jobId: 'shortlink-delete-b' }
      ]
    ])
    expect(mockDeleteShortLink).not.toHaveBeenCalled()
  })

  it('deletes the short link directly when the queue rejects it', async () => {
    mockQueueAdd
      .mockRejectedValueOnce(new Error('redis down'))
      .mockResolvedValueOnce(undefined)

    await expect(enqueueShortLinkDeletes(['a', 'b'])).resolves.toBeUndefined()

    expect(mockDeleteShortLink).toHaveBeenCalledTimes(1)
    expect(mockDeleteShortLink).toHaveBeenCalledWith('a')
  })

  it('resolves when the direct delete fails too', async () => {
    mockQueueAdd.mockRejectedValueOnce(new Error('redis down'))
    mockDeleteShortLink.mockRejectedValueOnce(new Error('gateway down'))

    await expect(enqueueShortLinkDeletes(['a'])).resolves.toBeUndefined()

    expect(mockDeleteShortLink).toHaveBeenCalledWith('a')
  })

  it('adds nothing for an empty list', async () => {
    await enqueueShortLinkDeletes([])

    expect(mockQueueAdd).not.toHaveBeenCalled()
  })
})
