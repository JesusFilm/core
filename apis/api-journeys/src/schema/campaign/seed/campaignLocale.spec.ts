import enBundle from '@core/locales/en/libs-journeys-ui.json'

import {
  campaignLocaleFolder,
  resolveCampaignStringValues
} from './campaignLocale'
import {
  CAMPAIGN_STRING_DEFAULTS,
  CAMPAIGN_STRING_KEYS
} from './campaignStrings'

vi.mock('../../../../../../libs/locales/fr-FR/libs-journeys-ui.json', () => ({
  default: { 'Copy link': 'Copier le lien', Open: '  ' }
}))

vi.mock(
  '../../../../../../libs/locales/fr-FR/apps-journeys-admin.json',
  () => ({
    default: { 'Copy link': 'Copier (admin)', 'Link copied': 'Lien copié' }
  })
)

describe('campaignLocale', () => {
  describe('English defaults', () => {
    it.each(CAMPAIGN_STRING_KEYS)(
      'has %s in the libs-journeys-ui bundle',
      (key) => {
        const defaultValue = CAMPAIGN_STRING_DEFAULTS[key]

        expect((enBundle as Record<string, string>)[defaultValue]).toBe(
          defaultValue
        )
      }
    )
  })

  describe('campaignLocaleFolder', () => {
    it('maps a language tag to its folder', () => {
      expect(campaignLocaleFolder('fr')).toBe('fr-FR')
      expect(campaignLocaleFolder('fr-CA')).toBe('fr-FR')
      expect(campaignLocaleFolder('zh-Hant')).toBe('zh-Hant-TW')
    })

    it('returns null for English, unknown and missing tags', () => {
      expect(campaignLocaleFolder('en')).toBeNull()
      expect(campaignLocaleFolder('xx')).toBeNull()
      expect(campaignLocaleFolder(null)).toBeNull()
    })
  })

  describe('resolveCampaignStringValues', () => {
    it('returns the English defaults for English', async () => {
      expect(await resolveCampaignStringValues('en')).toEqual(
        CAMPAIGN_STRING_DEFAULTS
      )
    })

    it('prefers the libs bundle, then the admin bundle, then English', async () => {
      const values = await resolveCampaignStringValues('fr')

      expect(values).toEqual({
        ...CAMPAIGN_STRING_DEFAULTS,
        copy: 'Copier le lien',
        copied: 'Lien copié'
      })
    })
  })
})
