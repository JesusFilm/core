import { jest } from '@jest/globals'
import { Dispatch, SetStateAction } from 'react'

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
  let setResourcesMock: jest.Mock<
    Dispatch<SetStateAction<Record<string, Record<string, any>>>>
  >

  beforeEach(() => {
    setResourcesMock = jest.fn()

    jest.resetModules()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('successfully loads and sets resources for a standard locale (en)', async () => {
    // Mock the specific JSON files that will be dynamically imported for the 'en' locale
    jest.mock(
      '../../../../../../../../../../libs/locales/en/libs-journeys-ui.json',
      () => mockUiResourcesData,
      { virtual: true }
    )
    jest.mock(
      '../../../../../../../../../../libs/locales/en/apps-journeys-admin.json',
      () => mockAdminResourcesData,
      { virtual: true }
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
    jest.mock(
      '../../../../../../../../../../libs/locales/zh-Hans-CN/libs-journeys-ui.json',
      () => mockUiResourcesData,
      { virtual: true }
    )
    jest.mock(
      '../../../../../../../../../../libs/locales/zh-Hans-CN/apps-journeys-admin.json',
      () => mockAdminResourcesData,
      { virtual: true }
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
    jest.mock(
      '../../../../../../../../../../libs/locales/ko-KR/libs-journeys-ui.json',
      () => mockUiResourcesData,
      { virtual: true }
    )
    jest.mock(
      '../../../../../../../../../../libs/locales/ko-KR/apps-journeys-admin.json',
      () => mockAdminResourcesData,
      { virtual: true }
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
})
