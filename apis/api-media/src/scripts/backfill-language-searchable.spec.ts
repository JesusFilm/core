import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import {
  type PrismaClient as LanguagesPrismaClient,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

import { prismaMock } from '../../test/prismaMock'

// eslint-disable-next-line import/order -- must follow the mocks above
import { main } from './backfill-language-searchable'

vi.mock('@core/prisma/languages/client', () => ({
  __esModule: true,
  prisma: mockDeep<LanguagesPrismaClient>()
}))

const languagesPrismaMock =
  languagesPrisma as unknown as DeepMockProxy<LanguagesPrismaClient>

const ORIGINAL_ARGV = process.argv

describe('backfill-language-searchable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prismaMock.videoVariant.groupBy).mockReset()
    languagesPrismaMock.language.findMany.mockReset()
    languagesPrismaMock.language.updateMany.mockReset()
    process.argv = ['node', 'backfill-language-searchable.ts']
  })

  afterAll(() => {
    process.argv = ORIGINAL_ARGV
  })

  it('does nothing when no languages have variants', async () => {
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([])

    await main()

    expect(languagesPrismaMock.language.findMany).not.toHaveBeenCalled()
    expect(languagesPrismaMock.language.updateMany).not.toHaveBeenCalled()
  })

  it('does nothing when no hidden languages are found', async () => {
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([
      { languageId: '1234' }
    ] as never)
    languagesPrismaMock.language.findMany.mockResolvedValue([])

    await main()

    expect(languagesPrismaMock.language.updateMany).not.toHaveBeenCalled()
  })

  it('dry run reports candidates without writing', async () => {
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([
      { languageId: '1234' },
      { languageId: '5678' }
    ] as never)
    languagesPrismaMock.language.findMany.mockResolvedValue([
      { id: '1234', iso3: 'plu' }
    ] as never)

    await main()

    expect(languagesPrismaMock.language.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['1234', '5678'] },
        hasVideos: false,
        searchable: true
      },
      select: { id: true, iso3: true }
    })
    expect(languagesPrismaMock.language.updateMany).not.toHaveBeenCalled()
  })

  it('--apply marks the hidden languages searchable: false', async () => {
    process.argv.push('--apply')
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([
      { languageId: '1234' }
    ] as never)
    languagesPrismaMock.language.findMany.mockResolvedValue([
      { id: '1234', iso3: 'plu' }
    ] as never)
    languagesPrismaMock.language.updateMany.mockResolvedValue({ count: 1 })

    await main()

    expect(languagesPrismaMock.language.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['1234'] } },
      data: { searchable: false }
    })
  })
})
