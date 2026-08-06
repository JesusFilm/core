import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import {
  type PrismaClient as LanguagesPrismaClient,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

import { logger } from '../../logger'

import { ensureLanguageHasVideosTrue } from './ensureLanguageHasVideos'
import { updateLanguageInAlgoliaFromMedia } from './updateLanguageInAlgolia'

vi.mock('@core/prisma/languages/client', () => ({
  __esModule: true,
  prisma: mockDeep<LanguagesPrismaClient>()
}))

vi.mock('./updateLanguageInAlgolia', () => ({
  updateLanguageInAlgoliaFromMedia: vi.fn()
}))

const languagesPrismaMock =
  languagesPrisma as unknown as DeepMockProxy<LanguagesPrismaClient>
const mockedUpdateAlgolia = vi.mocked(updateLanguageInAlgoliaFromMedia)

// ensureLanguageHasVideosTrue queries with `select: { id, hasVideos }`, so the
// resolved value is this narrow payload rather than the full Language model the
// prisma mock is typed against.
interface LanguageHasVideosPayload {
  id: string
  hasVideos: boolean
}

function mockFindUnique(language: LanguageHasVideosPayload | null): void {
  languagesPrismaMock.language.findUnique.mockResolvedValue(language as never)
}

describe('ensureLanguageHasVideosTrue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing for an empty language id', async () => {
    await ensureLanguageHasVideosTrue('   ')

    expect(languagesPrismaMock.language.findUnique).not.toHaveBeenCalled()
    expect(mockedUpdateAlgolia).not.toHaveBeenCalled()
  })

  it('does nothing when the language does not exist', async () => {
    mockFindUnique(null)

    await ensureLanguageHasVideosTrue('missing')

    expect(languagesPrismaMock.language.update).not.toHaveBeenCalled()
    expect(mockedUpdateAlgolia).not.toHaveBeenCalled()
  })

  it('flips hasVideos and updates algolia when previously false', async () => {
    mockFindUnique({ id: '1234', hasVideos: false })

    await ensureLanguageHasVideosTrue('1234')

    expect(languagesPrismaMock.language.update).toHaveBeenCalledWith({
      where: { id: '1234' },
      data: { hasVideos: true }
    })
    expect(mockedUpdateAlgolia).toHaveBeenCalledWith('1234', logger)
  })

  it('still updates algolia when hasVideos was already true without a db write', async () => {
    mockFindUnique({ id: '1234', hasVideos: true })

    await ensureLanguageHasVideosTrue('1234')

    expect(languagesPrismaMock.language.update).not.toHaveBeenCalled()
    expect(mockedUpdateAlgolia).toHaveBeenCalledWith('1234', logger)
  })
})
