import { CAMPAIGN_LOCALE_FOLDERS } from '@core/journeys/ui/Campaign/libs/campaignStrings'

import i18nConfig from './next-i18next.config'

describe('next-i18next.config', () => {
  // The config is CommonJS and runs in the browser, so it keeps its own copy
  // of the Campaign String registry's locale-folder map.
  it('maps every language to the same folder as the Campaign String registry', () => {
    const fallbackLng = i18nConfig.fallbackLng as Record<string, string[]>
    const folders = Object.fromEntries(
      Object.entries(fallbackLng)
        .filter(([tag]) => tag !== 'default')
        .map(([tag, [folder]]) => [tag, folder])
    )

    expect(folders).toEqual(CAMPAIGN_LOCALE_FOLDERS)
  })
})
