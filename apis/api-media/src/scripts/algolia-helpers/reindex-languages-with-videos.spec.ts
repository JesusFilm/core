import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import {
  type PrismaClient as LanguagesPrismaClient,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

import { prismaMock } from '../../../test/prismaMock'
import {
  reindexLanguagesWithVideosInAlgolia,
  removeLanguagesFromAlgolia
} from '../../lib/languages/updateLanguageInAlgolia'

// eslint-disable-next-line import/order -- must follow the mocks above
import { findHiddenLanguageIds, main } from './reindex-languages-with-videos'

vi.mock('@core/prisma/languages/client', () => ({
  __esModule: true,
  prisma: mockDeep<LanguagesPrismaClient>()
}))

vi.mock('../../lib/languages/updateLanguageInAlgolia', () => ({
  reindexLanguagesWithVideosInAlgolia: vi.fn(),
  removeLanguagesFromAlgolia: vi.fn()
}))

const languagesPrismaMock =
  languagesPrisma as unknown as DeepMockProxy<LanguagesPrismaClient>

const mockedReindex =
  reindexLanguagesWithVideosInAlgolia as unknown as ReturnType<typeof vi.fn>
const mockedRemove = removeLanguagesFromAlgolia as unknown as ReturnType<
  typeof vi.fn
>

describe('findHiddenLanguageIds', () => {
  beforeEach(() => {
    vi.mocked(prismaMock.videoVariant.groupBy).mockReset()
    languagesPrismaMock.language.findMany.mockReset()
  })

  it('returns no ids when no languages have variants', async () => {
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([])

    const result = await findHiddenLanguageIds()

    expect(result).toEqual([])
    expect(languagesPrismaMock.language.findMany).not.toHaveBeenCalled()
  })

  it('returns hasVideos: false languages that have variants', async () => {
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([
      { languageId: '1234' },
      { languageId: '5678' }
    ] as never)
    languagesPrismaMock.language.findMany.mockResolvedValue([
      { id: '1234' }
    ] as never)

    const result = await findHiddenLanguageIds()

    expect(result).toEqual(['1234'])
    expect(languagesPrismaMock.language.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['1234', '5678'] }, hasVideos: false },
      select: { id: true }
    })
  })
})

describe('main', () => {
  beforeEach(() => {
    vi.mocked(prismaMock.videoVariant.groupBy).mockReset()
    languagesPrismaMock.language.findMany.mockReset()
    mockedReindex.mockReset()
    mockedRemove.mockReset()
  })

  it('removes the hidden languages before reindexing the visible ones', async () => {
    mockedReindex.mockResolvedValue({ count: 3 })
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([
      { languageId: '1234' }
    ] as never)
    languagesPrismaMock.language.findMany.mockResolvedValue([
      { id: '1234' }
    ] as never)
    mockedRemove.mockResolvedValue({ removed: 1 })

    await main()

    expect(mockedRemove).toHaveBeenCalledWith(['1234'], expect.anything())
    expect(mockedReindex).toHaveBeenCalled()
    expect(mockedRemove.mock.invocationCallOrder[0]).toBeLessThan(
      mockedReindex.mock.invocationCallOrder[0]
    )
  })

  it('reports zero removed when nothing is hidden', async () => {
    mockedReindex.mockResolvedValue({ count: 3 })
    vi.mocked(prismaMock.videoVariant.groupBy).mockResolvedValue([])
    languagesPrismaMock.language.findMany.mockResolvedValue([])
    mockedRemove.mockResolvedValue({ removed: 0 })

    await main()

    expect(mockedRemove).toHaveBeenCalledWith([], expect.anything())
  })
})
