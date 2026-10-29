import { campaignStringWording } from '@core/journeys/ui/Campaign/libs/campaignStrings'
import { CampaignStringKey } from '@core/prisma/journeys/client'

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
  it('seeds one string per Prisma CampaignStringKey', () => {
    expect([...CAMPAIGN_STRING_KEYS].sort()).toEqual(
      Object.values(CampaignStringKey).sort()
    )
  })

  describe('English defaults', () => {
    let enBundle: Record<string, string>

    beforeAll(async () => {
      // Loaded by relative path, as campaignLocale.ts loads every bundle.
      const folder = 'en'
      const bundle = await import(
        /* webpackChunkName: "campaign-locale-[request]" */
        `../../../../../../libs/locales/${folder}/libs-journeys-ui.json`
      )
      enBundle = bundle.default
    })

    it.each(CAMPAIGN_STRING_KEYS)(
      'has %s in the libs-journeys-ui bundle',
      (key) => {
        const defaultValue = CAMPAIGN_STRING_DEFAULTS[key]

        expect(enBundle[defaultValue]).toBe(defaultValue)
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
    // Characterization: the wording a new campaign was seeded with before
    // the Campaign String registry, copied literally.
    it('seeds the same English wording as before', async () => {
      expect(await resolveCampaignStringValues(null)).toEqual({
        allRegions: 'All regions',
        step1: 'Pick a language your friend understands.',
        step2: 'Preview what they will see.',
        step2help: 'Tap through the preview like they would.',
        step3: 'Share this link with them.',
        step4: 'Or download a QR code for print.',
        copy: 'Copy link',
        copied: 'Link copied',
        downloadQr: 'Download QR code',
        open: 'Open',
        watch: 'Watch',
        openTemplate: 'Open journey',
        youtube: 'Watch on YouTube',
        totalVisitors: 'Total visitors',
        topCountry: 'Top country',
        seeAllOnWatch: 'See all on Watch',
        videos: 'videos',
        noJourneys: 'Journeys for this region are coming soon'
      })
    })

    it('seeds the same French wording as before', async () => {
      expect(await resolveCampaignStringValues('fr')).toEqual({
        allRegions: 'All regions',
        step1: 'Pick a language your friend understands.',
        step2: 'Preview what they will see.',
        step2help: 'Tap through the preview like they would.',
        step3: 'Share this link with them.',
        step4: 'Or download a QR code for print.',
        copy: 'Copier le lien',
        copied: 'Lien copié',
        downloadQr: 'Download QR code',
        open: 'Open',
        watch: 'Watch',
        openTemplate: 'Open journey',
        youtube: 'Watch on YouTube',
        totalVisitors: 'Total visitors',
        topCountry: 'Top country',
        seeAllOnWatch: 'See all on Watch',
        videos: 'videos',
        noJourneys: 'Journeys for this region are coming soon'
      })
    })

    it('returns the registry English for every key with no language', async () => {
      expect(await resolveCampaignStringValues(undefined)).toEqual(
        campaignStringWording((english) => english)
      )
    })

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
