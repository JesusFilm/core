import { Dispatch, SetStateAction } from 'react'
import { type Mock } from 'vitest'

const mockUiResourcesData = { message: 'Mock UI Resource' }
const mockAdminResourcesData = { message: 'Mock Admin Resource' }

interface ModuleUnderTest {
  loadJourneyLocaleResources: (
    locale: string,
    setResources: Dispatch<SetStateAction<Record<string, Record<string, any>>>>
  ) => Promise<void>
  resolveLocaleFolder: (bcp47: string) => string
}

describe('loadJourneyLocaleResources', () => {
  let setResourcesMock: Mock<
    Dispatch<SetStateAction<Record<string, Record<string, any>>>>
  >

  beforeEach(() => {
    setResourcesMock = vi.fn()

    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('resolveLocaleFolder', () => {
    test('maps short language codes to their region folder', async () => {
      const { resolveLocaleFolder }: ModuleUnderTest = await import(
        /* webpackChunkName: "test-loadJourneyLocaleResources" */ './loadJourneyLocaleResources'
      )

      expect(resolveLocaleFolder('fr')).toBe('fr-FR')
      expect(resolveLocaleFolder('de')).toBe('de-DE')
      expect(resolveLocaleFolder('zh')).toBe('zh-Hans-CN')
      // every journey-language folder must resolve, not just the URL locales
      expect(resolveLocaleFolder('ar')).toBe('ar-SA')
      expect(resolveLocaleFolder('my')).toBe('my-MM')
      expect(resolveLocaleFolder('zh-Hant')).toBe('zh-Hant-TW')
    })

    test('canonicalises casing and passes region tags through', async () => {
      const { resolveLocaleFolder }: ModuleUnderTest = await import(
        /* webpackChunkName: "test-loadJourneyLocaleResources" */ './loadJourneyLocaleResources'
      )

      expect(resolveLocaleFolder('zh-Hans-CN')).toBe('zh-Hans-CN')
      expect(resolveLocaleFolder('zh-hans-cn')).toBe('zh-Hans-CN')
      expect(resolveLocaleFolder('en')).toBe('en')
    })
  })

  test('loads resources and keys them by the active locale (en)', async () => {
    // Mock the specific JSON files that will be dynamically imported for the 'en' locale
    vi.mock(
      '../../../../../../../../../../libs/locales/en/libs-journeys-ui.json',
      () => ({ default: mockUiResourcesData })
    )
    vi.mock(
      '../../../../../../../../../../libs/locales/en/apps-journeys-admin.json',
      () => ({ default: mockAdminResourcesData })
    )

    // Dynamically import the module under test AFTER the mocks are set up
    const { loadJourneyLocaleResources }: ModuleUnderTest = await import(
      /* webpackChunkName: "test-loadJourneyLocaleResources" */ './loadJourneyLocaleResources'
    )

    await loadJourneyLocaleResources('en', setResourcesMock)

    expect(setResourcesMock).toHaveBeenCalledTimes(1)
    expect(setResourcesMock).toHaveBeenCalledWith({
      en: {
        'libs-journeys-ui': mockUiResourcesData,
        'apps-journeys-admin': mockAdminResourcesData
      }
    })
  })

  test('resolves the region folder and keys by the bcp47 tag (zh-Hans-CN)', async () => {
    vi.mock(
      '../../../../../../../../../../libs/locales/zh-Hans-CN/libs-journeys-ui.json',
      () => ({ default: mockUiResourcesData })
    )
    vi.mock(
      '../../../../../../../../../../libs/locales/zh-Hans-CN/apps-journeys-admin.json',
      () => ({ default: mockAdminResourcesData })
    )

    const { loadJourneyLocaleResources }: ModuleUnderTest = await import(
      /* webpackChunkName: "test-loadJourneyLocaleResources" */ './loadJourneyLocaleResources'
    )

    await loadJourneyLocaleResources('zh-Hans-CN', setResourcesMock)

    expect(setResourcesMock).toHaveBeenCalledTimes(1)
    expect(setResourcesMock).toHaveBeenCalledWith({
      'zh-Hans-CN': {
        'libs-journeys-ui': mockUiResourcesData,
        'apps-journeys-admin': mockAdminResourcesData
      }
    })
  })

  test('does not set resources when the locale folder has no files', async () => {
    const { loadJourneyLocaleResources }: ModuleUnderTest = await import(
      /* webpackChunkName: "test-loadJourneyLocaleResources" */ './loadJourneyLocaleResources'
    )

    await loadJourneyLocaleResources('xx', setResourcesMock)

    expect(setResourcesMock).not.toHaveBeenCalled()
  })
})
