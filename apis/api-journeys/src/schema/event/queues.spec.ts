import { getEmailQueue, getGoogleSheetsSyncQueue } from './queues'

describe('queues', () => {
  it('should return null (not undefined) for both queues in the test environment', () => {
    // NODE_ENV === 'test' at module load, so the lazy requires are skipped
    // and the holders must fall back to their null initializers.
    expect(getEmailQueue()).toBeNull()
    expect(getGoogleSheetsSyncQueue()).toBeNull()
  })
})
