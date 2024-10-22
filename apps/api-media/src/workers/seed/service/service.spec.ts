import { seedEditions } from './edition'
import { service } from './service'
import { seedTags } from './tag'

jest.mock('./edition', () => ({
  seedEditions: jest.fn()
}))

jest.mock('./tag', () => ({
  seedTags: jest.fn()
}))

describe('seed/service', () => {
  it('should seed', async () => {
    await service()
    expect(seedTags).toHaveBeenCalled()
    expect(seedEditions).toHaveBeenCalled()
  })
})
