import { seedEditions } from './edition'
import { service } from './service'
import { seedTags } from './tag'
import { seedTaxonomies } from './taxonomy'

jest.mock('./edition', () => ({
  seedEditions: jest.fn()
}))

jest.mock('./tag', () => ({
  seedTags: jest.fn()
}))

jest.mock('./taxonomy', () => ({
  seedTaxonomies: jest.fn()
}))

describe('seed/service', () => {
  it('should seed', async () => {
    await service()
    expect(seedTags).toHaveBeenCalled()
    expect(seedEditions).toHaveBeenCalled()
    expect(seedTaxonomies).toHaveBeenCalled()
  })
})
