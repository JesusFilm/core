import { vi } from 'vitest'
import { service } from './service'
import { seedTags } from './tag'
import { seedTaxonomies } from './taxonomy'
import { seedVideoLanguages } from './videoLanguage'

vi.mock('./tag', () => ({
  seedTags: vi.fn()
}))

vi.mock('./taxonomy', () => ({
  seedTaxonomies: vi.fn()
}))

vi.mock('./videoLanguage', () => ({
  seedVideoLanguages: vi.fn()
}))

describe('seed/service', () => {
  it('should seed', async () => {
    await service()
    expect(seedTags).toHaveBeenCalled()
    expect(seedTaxonomies).toHaveBeenCalled()
    expect(seedVideoLanguages).toHaveBeenCalled()
  })
})
