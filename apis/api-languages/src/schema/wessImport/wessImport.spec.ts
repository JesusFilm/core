import { parse } from 'graphql'

import { LanguageRole } from '@core/prisma/languages/client'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { runWessCountriesImport } from '../../scripts/wess-countries-import'
import { runWessCountryLanguagesImport } from '../../scripts/wess-country-languages-import'
import { runWessLanguagesImport } from '../../scripts/wess-languages-import'

vi.mock('../../scripts/wess-languages-import', () => ({
  runWessLanguagesImport: vi.fn()
}))
vi.mock('../../scripts/wess-countries-import', () => ({
  runWessCountriesImport: vi.fn()
}))
vi.mock('../../scripts/wess-country-languages-import', () => ({
  runWessCountryLanguagesImport: vi.fn()
}))
vi.mock('../../scripts/wess-import-lock', async () => {
  const actual = await vi.importActual<
    typeof import('../../scripts/wess-import-lock')
  >('../../scripts/wess-import-lock')
  return actual
})

const WESS_IMPORT_MUTATION = parse(`
  mutation WessImport {
    wessImport {
      success
      languagesImported
      nativeNamesImported
      countriesImported
      countryLanguagesImported
      message
    }
  }
`)

const authClient = getClient({
  headers: {
    authorization: 'token'
  }
})

const publicClient = getClient()

function mockPublisher(): void {
  prismaMock.userLanguageRole.findUnique.mockResolvedValue({
    id: 'roleId',
    userId: 'id',
    roles: [LanguageRole.publisher]
  })
}

describe('wessImport', () => {
  let lockHeld = false

  beforeEach(() => {
    vi.mocked(runWessLanguagesImport)
      .mockReset()
      .mockResolvedValue({ languagesImported: 10, nativeNamesImported: 3 })
    vi.mocked(runWessCountriesImport).mockReset().mockResolvedValue(5)
    vi.mocked(runWessCountryLanguagesImport).mockReset().mockResolvedValue(20)

    lockHeld = false
    prismaMock.$transaction.mockImplementation(async (fn) => {
      const tx = {
        $queryRaw: vi.fn().mockImplementation(async () => {
          if (lockHeld) {
            return [{ pg_try_advisory_lock: false }]
          }
          lockHeld = true
          return [{ pg_try_advisory_lock: true }]
        }),
        $executeRaw: vi.fn().mockImplementation(async () => {
          lockHeld = false
          return 1
        })
      }
      return fn(tx as never)
    })
  })

  it('runs all three imports in FK-safe order and returns a summary', async () => {
    mockPublisher()

    const data = await authClient({ document: WESS_IMPORT_MUTATION })

    expect(runWessLanguagesImport).toHaveBeenCalledTimes(1)
    expect(runWessCountriesImport).toHaveBeenCalledTimes(1)
    expect(runWessCountryLanguagesImport).toHaveBeenCalledTimes(1)

    // country-languages depends on languages + countries, so it must run last.
    const languagesOrder = vi.mocked(runWessLanguagesImport).mock
      .invocationCallOrder[0]
    const countriesOrder = vi.mocked(runWessCountriesImport).mock
      .invocationCallOrder[0]
    const countryLanguagesOrder = vi.mocked(runWessCountryLanguagesImport).mock
      .invocationCallOrder[0]
    expect(languagesOrder).toBeLessThan(countriesOrder)
    expect(countriesOrder).toBeLessThan(countryLanguagesOrder)

    expect(data).toHaveProperty('data.wessImport', {
      success: true,
      languagesImported: 10,
      nativeNamesImported: 3,
      countriesImported: 5,
      countryLanguagesImported: 20,
      message:
        'Imported 10 language(s) (3 native name(s)), 5 country(ies), and 20 country-language(s).'
    })
  })

  it('does not run the import for unauthenticated callers', async () => {
    const data = await publicClient({ document: WESS_IMPORT_MUTATION })

    expect(runWessLanguagesImport).not.toHaveBeenCalled()
    expect(data).toHaveProperty('errors')
  })

  it('rejects a second concurrent import while one is in progress', async () => {
    mockPublisher()

    let releaseFirstImport: (() => void) | undefined
    const firstImportGate = new Promise<void>((resolve) => {
      releaseFirstImport = resolve
    })

    vi.mocked(runWessLanguagesImport)
      .mockReset()
      .mockImplementationOnce(async () => {
        await firstImportGate
        return { languagesImported: 10, nativeNamesImported: 3 }
      })

    const first = authClient({ document: WESS_IMPORT_MUTATION })
    await Promise.resolve()
    const second = await authClient({ document: WESS_IMPORT_MUTATION })

    expect(second).toHaveProperty('errors')
    expect(runWessLanguagesImport).toHaveBeenCalledTimes(1)

    releaseFirstImport?.()
    await first

    expect(runWessLanguagesImport).toHaveBeenCalledTimes(1)
  })
})
