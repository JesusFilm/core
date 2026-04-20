import { prismaMock } from '../../../../../test/prismaMock'

import { seedTags } from './tag'

describe('seed/tag', () => {
  beforeEach(() => {
    prismaMock.tag.upsert.mockResolvedValue({
      id: 'mock-tag-id',
      name: 'mock',
      parentId: null,
      service: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.tagName.upsert.mockResolvedValue({
      id: 'mock-tag-name-id',
      tagId: 'mock-tag-id',
      value: 'mock',
      languageId: '529',
      primary: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  it('should upsert the Audience parent tag', async () => {
    await seedTags()

    expect(prismaMock.tag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: 'Audience' }
      })
    )
  })

  it('should upsert a separate Hindu tag', async () => {
    await seedTags()

    expect(prismaMock.tag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: 'Hindu' }
      })
    )
  })

  it('should upsert a separate Buddhist tag with correct spelling', async () => {
    await seedTags()

    expect(prismaMock.tag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: 'Buddhist' }
      })
    )
  })

  it('should not upsert the combined Hindu/Buddist tag', async () => {
    await seedTags()

    expect(prismaMock.tag.upsert).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name: 'Hindu/Buddist' }
      })
    )
  })
})
