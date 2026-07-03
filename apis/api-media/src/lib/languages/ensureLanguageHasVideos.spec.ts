import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended'

import {
  type PrismaClient as LanguagesPrismaClient,
  prisma as languagesPrisma
} from '@core/prisma/languages/client'

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
    languagesPrismaMock.language.findUnique.mockResolvedValue(null)

    await ensureLanguageHasVideosTrue('missing')

    expect(languagesPrismaMock.language.update).not.toHaveBeenCalled()
    expect(mockedUpdateAlgolia).not.toHaveBeenCalled()
  })

  it('flips hasVideos and updates algolia when previously false', async () => {
    languagesPrismaMock.language.findUnique.mockResolvedValue({
      id: '1234',
      hasVideos: false
    } as any)

    await ensureLanguageHasVideosTrue('1234')

    expect(languagesPrismaMock.language.update).toHaveBeenCalledWith({
      where: { id: '1234' },
      data: { hasVideos: true }
    })
    expect(mockedUpdateAlgolia).toHaveBeenCalledWith('1234')
  })

  it('still updates algolia when hasVideos was already true without a db write', async () => {
    languagesPrismaMock.language.findUnique.mockResolvedValue({
      id: '1234',
      hasVideos: true
    } as any)

    await ensureLanguageHasVideosTrue('1234')

    expect(languagesPrismaMock.language.update).not.toHaveBeenCalled()
    expect(mockedUpdateAlgolia).toHaveBeenCalledWith('1234')
  })
})
