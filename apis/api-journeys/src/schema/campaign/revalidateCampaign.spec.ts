import { mockQueueAdd } from '../../../test/bullmqMock'

import { enqueueCampaignRevalidation } from './revalidateCampaign'

describe('enqueueCampaignRevalidation', () => {
  it('queues one job per path, retried three times with exponential backoff', async () => {
    await enqueueCampaignRevalidation([
      '/home/campaign/christmas',
      '/home/campaign/christmas/eur'
    ])

    const options = {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    }
    expect(mockQueueAdd.mock.calls).toEqual([
      ['revalidate', { paths: ['/home/campaign/christmas'] }, options],
      ['revalidate', { paths: ['/home/campaign/christmas/eur'] }, options]
    ])
  })

  it('logs a queue failure instead of throwing', async () => {
    mockQueueAdd.mockRejectedValue(new Error('redis down'))

    await expect(
      enqueueCampaignRevalidation(['/home/campaign/christmas'])
    ).resolves.toBeUndefined()
  })
})
