import { prismaMock } from '../../test/prismaMock'

import { migrateHinduBuddhistTags } from './migrate-hindu-buddhist-tags'

describe('migrateHinduBuddhistTags', () => {
  const LEGACY_TAG = {
    id: 'legacy-tag-id',
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

  it('renames the legacy tag to Hindu (preserving id), updates its primary English TagName, and upserts Buddhist', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(LEGACY_TAG)
      .mockResolvedValueOnce(AUDIENCE_TAG)
      .mockResolvedValueOnce(null)
    prismaMock.tag.update.mockResolvedValue({
      ...LEGACY_TAG,
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

    await migrateHinduBuddhistTags()

    expect(prismaMock.tag.update).toHaveBeenCalledWith({
      where: { id: LEGACY_TAG.id },
      data: { name: 'Hindu' }
    })
    expect(prismaMock.tagName.updateMany).toHaveBeenCalledWith({
      where: { tagId: LEGACY_TAG.id, languageId: '529' },
      data: { value: 'Hindu' }
    })
    expect(prismaMock.tag.upsert).toHaveBeenCalledWith({
      where: { name: 'Buddhist' },
      create: { name: 'Buddhist', parentId: AUDIENCE_TAG.id },
      update: {}
    })
    expect(prismaMock.tagName.upsert).toHaveBeenCalledWith({
      where: {
        tagId_languageId: { tagId: BUDDHIST_TAG.id, languageId: '529' }
      },
      create: {
        tagId: BUDDHIST_TAG.id,
        value: 'Buddhist',
        languageId: '529',
        primary: true
      },
      update: {}
    })
  })

  it('deletes a pre-existing Hindu stub before renaming (collision guard)', async () => {
    const preExistingHindu = {
      id: 'seed-hindu-id',
      name: 'Hindu',
      parentId: 'audience-tag-id',
      service: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(LEGACY_TAG)
      .mockResolvedValueOnce(AUDIENCE_TAG)
      .mockResolvedValueOnce(preExistingHindu)
    prismaMock.tagName.deleteMany.mockResolvedValue({ count: 1 })
    prismaMock.tag.delete.mockResolvedValue(preExistingHindu)
    prismaMock.tag.update.mockResolvedValue({
      ...LEGACY_TAG,
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

    await migrateHinduBuddhistTags()

    expect(prismaMock.tagName.deleteMany).toHaveBeenCalledWith({
      where: { tagId: preExistingHindu.id }
    })
    expect(prismaMock.tag.delete).toHaveBeenCalledWith({
      where: { id: preExistingHindu.id }
    })
    expect(prismaMock.tag.update).toHaveBeenCalledWith({
      where: { id: LEGACY_TAG.id },
      data: { name: 'Hindu' }
    })
  })

  it('exits early when the legacy tag is absent (idempotent re-run)', async () => {
    prismaMock.tag.findUnique.mockResolvedValueOnce(null)

    await migrateHinduBuddhistTags()

    expect(prismaMock.tag.update).not.toHaveBeenCalled()
    expect(prismaMock.tag.upsert).not.toHaveBeenCalled()
    expect(prismaMock.tagName.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.tagName.upsert).not.toHaveBeenCalled()
    expect(prismaMock.tag.delete).not.toHaveBeenCalled()
  })

  it('throws when the Audience parent tag is missing and applies no mutations', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(LEGACY_TAG)
      .mockResolvedValueOnce(null)

    await expect(migrateHinduBuddhistTags()).rejects.toThrow(
      /parent tag "Audience" to exist/
    )
    expect(prismaMock.tag.update).not.toHaveBeenCalled()
    expect(prismaMock.tag.upsert).not.toHaveBeenCalled()
    expect(prismaMock.tagName.updateMany).not.toHaveBeenCalled()
  })

  it('never calls the dormant tagging table (regression guard)', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(LEGACY_TAG)
      .mockResolvedValueOnce(AUDIENCE_TAG)
      .mockResolvedValueOnce(null)
    prismaMock.tag.update.mockResolvedValue({ ...LEGACY_TAG, name: 'Hindu' })
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

    await migrateHinduBuddhistTags()

    expect(prismaMock.tagging.findMany).not.toHaveBeenCalled()
    expect(prismaMock.tagging.createMany).not.toHaveBeenCalled()
    expect(prismaMock.tagging.deleteMany).not.toHaveBeenCalled()
  })

  it('never deletes the legacy tag row (regression guard against previous delete-and-create approach)', async () => {
    prismaMock.tag.findUnique
      .mockResolvedValueOnce(LEGACY_TAG)
      .mockResolvedValueOnce(AUDIENCE_TAG)
      .mockResolvedValueOnce(null)
    prismaMock.tag.update.mockResolvedValue({ ...LEGACY_TAG, name: 'Hindu' })
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

    await migrateHinduBuddhistTags()

    expect(prismaMock.tag.delete).not.toHaveBeenCalledWith({
      where: { id: LEGACY_TAG.id }
    })
  })
})
