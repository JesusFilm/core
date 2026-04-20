import { prismaMock } from '../../test/prismaMock'

import { migrateHinduBuddhistTags } from './migrate-hindu-buddhist-tags'

describe('migrateHinduBuddhistTags', () => {
  const OLD_TAG = {
    id: 'old-tag-id',
    name: 'Hindu/Buddist',
    parentId: 'audience-tag-id',
    service: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const AUDIENCE_TAG = {
    id: 'audience-tag-id',
    name: 'Audience',
    parentId: null,
    service: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const EXISTING_HINDU_TAG = {
    id: 'seed-hindu-tag-id',
    name: 'Hindu',
    parentId: 'audience-tag-id',
    service: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const BUDDHIST_TAG = {
    id: 'buddhist-tag-id',
    name: 'Buddhist',
    parentId: 'audience-tag-id',
    service: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock)
    )
  })

  it('renames the old tag, creates Buddhist, and duplicates all taggings', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(OLD_TAG)
      .mockResolvedValueOnce(AUDIENCE_TAG)
      .mockResolvedValueOnce(null)
    prismaMock.tag.update.mockResolvedValue({
      ...OLD_TAG,
      name: 'Hindu'
    })
    prismaMock.tagName.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.tag.upsert.mockResolvedValue(BUDDHIST_TAG)
    prismaMock.tagName.upsert.mockResolvedValue({
      id: 'buddhist-tag-name-id',
      tagId: BUDDHIST_TAG.id,
      value: 'Buddhist',
      languageId: '529',
      primary: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.tagging.findMany.mockResolvedValue([
      {
        id: 'tagging-1',
        tagId: OLD_TAG.id,
        taggableId: 'journey-1',
        taggableType: 'Journey',
        context: 'template',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'tagging-2',
        tagId: OLD_TAG.id,
        taggableId: 'journey-2',
        taggableType: 'Journey',
        context: 'template',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])
    prismaMock.tagging.createMany.mockResolvedValue({ count: 2 })

    await migrateHinduBuddhistTags()

    expect(prismaMock.tag.delete).not.toHaveBeenCalled()
    expect(prismaMock.tag.update).toHaveBeenCalledWith({
      where: { id: OLD_TAG.id },
      data: { name: 'Hindu' }
    })
    expect(prismaMock.tagName.updateMany).toHaveBeenCalledWith({
      where: { tagId: OLD_TAG.id, languageId: '529' },
      data: { value: 'Hindu' }
    })
    expect(prismaMock.tag.upsert).toHaveBeenCalledWith({
      where: { name: 'Buddhist' },
      create: { name: 'Buddhist', parentId: AUDIENCE_TAG.id },
      update: {}
    })
    expect(prismaMock.tagName.upsert).toHaveBeenCalledWith({
      where: {
        tagId_languageId: {
          tagId: BUDDHIST_TAG.id,
          languageId: '529'
        }
      },
      create: {
        tagId: BUDDHIST_TAG.id,
        value: 'Buddhist',
        languageId: '529',
        primary: true
      },
      update: {}
    })
    expect(prismaMock.tagging.createMany).toHaveBeenCalledWith({
      data: [
        {
          taggableId: 'journey-1',
          taggableType: 'Journey',
          context: 'template',
          tagId: BUDDHIST_TAG.id
        },
        {
          taggableId: 'journey-2',
          taggableType: 'Journey',
          context: 'template',
          tagId: BUDDHIST_TAG.id
        }
      ],
      skipDuplicates: true
    })
  })

  it('removes a pre-existing Hindu tag (seed-created) before renaming the legacy tag', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(OLD_TAG)
      .mockResolvedValueOnce(AUDIENCE_TAG)
      .mockResolvedValueOnce(EXISTING_HINDU_TAG)
    prismaMock.tagName.deleteMany.mockResolvedValue({ count: 1 })
    prismaMock.tag.delete.mockResolvedValue(EXISTING_HINDU_TAG)
    prismaMock.tag.update.mockResolvedValue({
      ...OLD_TAG,
      name: 'Hindu'
    })
    prismaMock.tagName.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.tag.upsert.mockResolvedValue(BUDDHIST_TAG)
    prismaMock.tagName.upsert.mockResolvedValue({
      id: 'buddhist-tag-name-id',
      tagId: BUDDHIST_TAG.id,
      value: 'Buddhist',
      languageId: '529',
      primary: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.tagging.findMany.mockResolvedValue([])

    await migrateHinduBuddhistTags()

    expect(prismaMock.tagName.deleteMany).toHaveBeenCalledWith({
      where: { tagId: EXISTING_HINDU_TAG.id }
    })
    expect(prismaMock.tag.delete).toHaveBeenCalledWith({
      where: { id: EXISTING_HINDU_TAG.id }
    })
    expect(prismaMock.tag.update).toHaveBeenCalledWith({
      where: { id: OLD_TAG.id },
      data: { name: 'Hindu' }
    })
  })

  it('exits early when the old tag no longer exists (idempotent)', async () => {
    prismaMock.tag.findUnique.mockResolvedValueOnce(null)

    await migrateHinduBuddhistTags()

    expect(prismaMock.tag.update).not.toHaveBeenCalled()
    expect(prismaMock.tag.upsert).not.toHaveBeenCalled()
    expect(prismaMock.tagName.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.tagName.upsert).not.toHaveBeenCalled()
    expect(prismaMock.tagging.findMany).not.toHaveBeenCalled()
    expect(prismaMock.tagging.createMany).not.toHaveBeenCalled()
    expect(prismaMock.tag.delete).not.toHaveBeenCalled()
  })

  it('does not call createMany when the old tag has no taggings', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(OLD_TAG)
      .mockResolvedValueOnce(AUDIENCE_TAG)
      .mockResolvedValueOnce(null)
    prismaMock.tag.update.mockResolvedValue({ ...OLD_TAG, name: 'Hindu' })
    prismaMock.tagName.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.tag.upsert.mockResolvedValue(BUDDHIST_TAG)
    prismaMock.tagName.upsert.mockResolvedValue({
      id: 'buddhist-tag-name-id',
      tagId: BUDDHIST_TAG.id,
      value: 'Buddhist',
      languageId: '529',
      primary: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    prismaMock.tagging.findMany.mockResolvedValue([])

    await migrateHinduBuddhistTags()

    expect(prismaMock.tag.update).toHaveBeenCalled()
    expect(prismaMock.tag.upsert).toHaveBeenCalled()
    expect(prismaMock.tagging.createMany).not.toHaveBeenCalled()
  })

  it('throws when the Audience parent tag is missing', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(OLD_TAG)
      .mockResolvedValueOnce(null)

    await expect(migrateHinduBuddhistTags()).rejects.toThrow(
      /parent tag "Audience" to exist/
    )
    expect(prismaMock.tag.update).not.toHaveBeenCalled()
    expect(prismaMock.tag.upsert).not.toHaveBeenCalled()
  })
})
