import { getEmailQueue, getGoogleSheetsSyncQueue } from './queues'

describe('queues', () => {
  it('should return null for both queues in the test environment', () => {
    expect(getEmailQueue()).toBeNull()
    expect(getGoogleSheetsSyncQueue()).toBeNull()
  })
})
