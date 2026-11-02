import { expectTypeOf } from 'vitest'

import { CampaignStringKey } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_TYPENAMES } from '../campaignBlockGrammar'

import {
  CAMPAIGN_STRING_HOSTS,
  CAMPAIGN_STRING_KEYS,
  type CampaignStringKeyName,
  campaignLocaleFolder,
  campaignStringHosts,
  campaignStringKeysFor,
  campaignStringWording
} from './campaignStrings'

describe('campaignStrings', () => {
  const wording = campaignStringWording((english) => english)

  it('has the eighteen keys of the generated enum', () => {
    expect([...CAMPAIGN_STRING_KEYS].sort()).toEqual(
      Object.values(CampaignStringKey).sort()
    )
    expectTypeOf<CampaignStringKeyName>().toEqualTypeOf<`${CampaignStringKey}`>()
  })

  it.each(CAMPAIGN_STRING_KEYS)('has a wording and a host for %s', (key) => {
    expect(wording[key].trim()).not.toBe('')
    expect(campaignStringHosts(key).length).toBeGreaterThan(0)
    for (const host of campaignStringHosts(key))
      expect(CAMPAIGN_TYPENAMES).toContain(host)
  })

  it('passes each English wording through t', () => {
    const translated = campaignStringWording((english) => `fr:${english}`)

    expect(translated.copy).toBe('fr:Copy link')
    expect(Object.keys(translated)).toEqual([...CAMPAIGN_STRING_KEYS])
  })

  it('hosts allRegions on the header, then Analytics', () => {
    expect(campaignStringHosts('allRegions')).toEqual([
      'CampaignHeaderBlock',
      'CampaignAnalyticsBlock'
    ])
  })

  it('hosts videos on the carousel, then the Hero, then Featured Media', () => {
    expect(campaignStringHosts('videos')).toEqual([
      'CampaignVideoCarouselBlock',
      'CampaignHeroBlock',
      'CampaignFeaturedMediaBlock'
    ])
  })

  describe('campaignStringKeysFor', () => {
    it('lists a section’s strings in seed order', () => {
      expect(campaignStringKeysFor('CampaignVideoCarouselBlock')).toEqual([
        'watch',
        'youtube',
        'seeAllOnWatch',
        'videos'
      ])
      expect(campaignStringKeysFor('CampaignAnalyticsBlock')).toEqual([
        'allRegions',
        'totalVisitors',
        'topCountry'
      ])
    })

    it('returns nothing for a section that shows no strings', () => {
      expect(campaignStringKeysFor('CampaignRegionHeaderBlock')).toEqual([])
      expect(campaignStringKeysFor('NotABlock')).toEqual([])
    })
  })

  describe('campaignLocaleFolder', () => {
    it('maps the exact tag, then the primary subtag', () => {
      expect(campaignLocaleFolder('zh-Hant')).toBe('zh-Hant-TW')
      expect(campaignLocaleFolder('zh-Hans')).toBe('zh-Hans-CN')
      expect(campaignLocaleFolder('pt-PT')).toBe('pt-BR')
    })

    it('returns null for English, unknown and missing tags', () => {
      expect(campaignLocaleFolder('en')).toBeNull()
      expect(campaignLocaleFolder('xx')).toBeNull()
      expect(campaignLocaleFolder(undefined)).toBeNull()
    })
  })
})
