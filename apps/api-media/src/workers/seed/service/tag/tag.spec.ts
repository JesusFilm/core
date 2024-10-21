import { prismaMock } from '../../../../../test/prismaMock'

import { seedTags } from './tag'

describe('seed/tag', () => {
  it('should seed tags', async () => {
    prismaMock.tag.upsert.mockImplementation()
    await seedTags()
    expect(prismaMock.tag.upsert).toHaveBeenCalledTimes(7)
  })
})
