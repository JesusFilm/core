import { Dispatch, SetStateAction } from 'react'
import { type Mock } from 'vitest'

const mockUiResourcesData = { message: 'Mock UI Resource' }
const mockAdminResourcesData = { message: 'Mock Admin Resource' }

interface ModuleUnderTest {
  loadJourneyLocaleResources: (
    locale: string,
    setResources: Dispatch<SetStateAction<Record<string, Record<string, any>>>>,
    directoryLocale: string
  ) => Promise<void>
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

  test('successfully loads and sets resources for a standard locale (en)', async () => {
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

    await loadJourneyLocaleResources('en', setResourcesMock, 'en')

    expect(setResourcesMock).toHaveBeenCalledTimes(1)
    expect(setResourcesMock).toHaveBeenCalledWith({
      en: {
        'libs-journeys-ui': mockUiResourcesData,
        'apps-journeys-admin': mockAdminResourcesData
      }
    })
  })

  test('correctly maps directoryLocale zh-Hans-CN to i18nKey zh-Hans', async () => {
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

    await loadJourneyLocaleResources('zh-hans', setResourcesMock, 'zh-Hans-CN')

    expect(setResourcesMock).toHaveBeenCalledTimes(1)
    expect(setResourcesMock).toHaveBeenCalledWith({
      'zh-Hans': {
        // Expecting the mapped i18nKey
        'libs-journeys-ui': mockUiResourcesData,
        'apps-journeys-admin': mockAdminResourcesData
      }
    })
  })

  test('uses passed locale as key if no specific i18nLocale mapping applies', async () => {
    vi.mock(
      '../../../../../../../../../../libs/locales/ko-KR/libs-journeys-ui.json',
      () => ({ default: mockUiResourcesData })
    )
    vi.mock(
      '../../../../../../../../../../libs/locales/ko-KR/apps-journeys-admin.json',
      () => ({ default: mockAdminResourcesData })
    )

    const { loadJourneyLocaleResources }: ModuleUnderTest = await import(
      /* webpackChunkName: "test-loadJourneyLocaleResources" */ './loadJourneyLocaleResources'
    )

    await loadJourneyLocaleResources('ko', setResourcesMock, 'ko-KR')

    expect(setResourcesMock).toHaveBeenCalledTimes(1)
    expect(setResourcesMock).toHaveBeenCalledWith({
      ko: {
        'libs-journeys-ui': mockUiResourcesData,
        'apps-journeys-admin': mockAdminResourcesData
      }
    })
  })

  test('returns early without attempting imports when locale is not in LOCALE_MAP', async () => {
    const { loadJourneyLocaleResources }: ModuleUnderTest = await import(
      /* webpackChunkName: "test-loadJourneyLocaleResources" */ './loadJourneyLocaleResources'
    )

    await loadJourneyLocaleResources(
      'someRandomLocale',
      setResourcesMock,
      'someRandomLocale'
    )

    expect(setResourcesMock).not.toHaveBeenCalled()
  })
})
