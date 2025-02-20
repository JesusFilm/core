import { service } from './service'
import { seedTags } from './tag'
import { seedTaxonomies } from './taxonomy'
import { seedVideoLanguages } from './videoLanguage'

jest.mock('./tag', () => ({
  seedTags: jest.fn()
}))

jest.mock('./taxonomy', () => ({
  seedTaxonomies: jest.fn()
}))

jest.mock('./videoLanguage', () => ({
  seedVideoLanguages: jest.fn()
}))

describe('seed/service', () => {
  it('should seed', async () => {
    await service()
    expect(seedTags).toHaveBeenCalled()
    expect(seedTaxonomies).toHaveBeenCalled()
    expect(seedVideoLanguages).toHaveBeenCalled()
  })
})
