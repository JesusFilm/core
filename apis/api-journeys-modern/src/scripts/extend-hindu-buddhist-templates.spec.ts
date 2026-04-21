import { prismaMock } from '../../test/prismaMock'

jest.mock('@core/prisma/media/client', () => ({
  prisma: {
    tag: {
      findUnique: jest.fn()
    },
    $disconnect: jest.fn()
  }
}))

const { prisma: mockPrismaMedia } = jest.requireMock(
  '@core/prisma/media/client'
)

import { extendHinduBuddhistTemplates } from './extend-hindu-buddhist-templates'

const HINDU_TAG = {
  id: 'hindu-tag-id',
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

describe('extendHinduBuddhistTemplates', () => {
  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback(prismaMock)
    )
  })

  it('creates a Buddhist JourneyTag for every journey linked to Hindu (with --apply)', async () => {
    mockPrismaMedia.tag.findUnique
      .mockResolvedValueOnce(HINDU_TAG)
      .mockResolvedValueOnce(BUDDHIST_TAG)
    prismaMock.journeyTag.findMany.mockResolvedValue([
      { journeyId: 'journey-1' },
      { journeyId: 'journey-2' },
      { journeyId: 'journey-3' },
      { journeyId: 'journey-4' }
    ] as any)
    prismaMock.journeyTag.createMany.mockResolvedValue({ count: 4 })

    const result = await extendHinduBuddhistTemplates(false)

    expect(prismaMock.journeyTag.findMany).toHaveBeenCalledWith({
      where: { tagId: HINDU_TAG.id },
      select: { journeyId: true }
    })
    expect(prismaMock.journeyTag.createMany).toHaveBeenCalledWith({
      data: [
        { journeyId: 'journey-1', tagId: BUDDHIST_TAG.id },
        { journeyId: 'journey-2', tagId: BUDDHIST_TAG.id },
        { journeyId: 'journey-3', tagId: BUDDHIST_TAG.id },
        { journeyId: 'journey-4', tagId: BUDDHIST_TAG.id }
      ],
      skipDuplicates: true
    })
    expect(result).toEqual({
      hinduTagId: HINDU_TAG.id,
      buddhistTagId: BUDDHIST_TAG.id,
      affectedJourneyIds: ['journey-1', 'journey-2', 'journey-3', 'journey-4'],
      createdCount: 4,
      dryRun: false
    })
  })

  it('does not call createMany in dry-run mode', async () => {
    mockPrismaMedia.tag.findUnique
      .mockResolvedValueOnce(HINDU_TAG)
      .mockResolvedValueOnce(BUDDHIST_TAG)
    prismaMock.journeyTag.findMany.mockResolvedValue([
      { journeyId: 'journey-1' },
      { journeyId: 'journey-2' }
    ] as any)

    const result = await extendHinduBuddhistTemplates(true)

    expect(prismaMock.journeyTag.createMany).not.toHaveBeenCalled()
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(result.dryRun).toBe(true)
    expect(result.createdCount).toBe(0)
    expect(result.affectedJourneyIds).toEqual(['journey-1', 'journey-2'])
  })

  it('exits early with createdCount 0 when no journeys link to Hindu', async () => {
    mockPrismaMedia.tag.findUnique
      .mockResolvedValueOnce(HINDU_TAG)
      .mockResolvedValueOnce(BUDDHIST_TAG)
    prismaMock.journeyTag.findMany.mockResolvedValue([])

    const result = await extendHinduBuddhistTemplates(false)

    expect(prismaMock.journeyTag.createMany).not.toHaveBeenCalled()
    expect(result.affectedJourneyIds).toEqual([])
    expect(result.createdCount).toBe(0)
  })

  it('handles idempotent re-runs: second run returns createdCount 0 when all duplicates are skipped', async () => {
    mockPrismaMedia.tag.findUnique
      .mockResolvedValueOnce(HINDU_TAG)
      .mockResolvedValueOnce(BUDDHIST_TAG)
    prismaMock.journeyTag.findMany.mockResolvedValue([
      { journeyId: 'journey-1' }
    ] as any)
    prismaMock.journeyTag.createMany.mockResolvedValue({ count: 0 })

    const result = await extendHinduBuddhistTemplates(false)

    expect(prismaMock.journeyTag.createMany).toHaveBeenCalledWith({
      data: [{ journeyId: 'journey-1', tagId: BUDDHIST_TAG.id }],
      skipDuplicates: true
    })
    expect(result.createdCount).toBe(0)
  })

  it('throws when Hindu tag is missing in media DB', async () => {
    mockPrismaMedia.tag.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(BUDDHIST_TAG)

    await expect(extendHinduBuddhistTemplates(false)).rejects.toThrow(
      /Run `nx run api-media:migrate-hindu-buddhist-tags` first/
    )
    expect(prismaMock.journeyTag.findMany).not.toHaveBeenCalled()
    expect(prismaMock.journeyTag.createMany).not.toHaveBeenCalled()
  })

  it('throws when Buddhist tag is missing in media DB', async () => {
    mockPrismaMedia.tag.findUnique
      .mockResolvedValueOnce(HINDU_TAG)
      .mockResolvedValueOnce(null)

    await expect(extendHinduBuddhistTemplates(false)).rejects.toThrow(
      /Run `nx run api-media:migrate-hindu-buddhist-tags` first/
    )
    expect(prismaMock.journeyTag.findMany).not.toHaveBeenCalled()
    expect(prismaMock.journeyTag.createMany).not.toHaveBeenCalled()
  })

  it('never deletes JourneyTag rows or touches media writes (regression guard)', async () => {
    mockPrismaMedia.tag.findUnique
      .mockResolvedValueOnce(HINDU_TAG)
      .mockResolvedValueOnce(BUDDHIST_TAG)
    prismaMock.journeyTag.findMany.mockResolvedValue([
      { journeyId: 'journey-1' }
    ] as any)
    prismaMock.journeyTag.createMany.mockResolvedValue({ count: 1 })

    await extendHinduBuddhistTemplates(false)

    expect(prismaMock.journeyTag.deleteMany).not.toHaveBeenCalled()
    expect(prismaMock.journeyTag.delete).not.toHaveBeenCalled()
  })
})
