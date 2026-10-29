import { campaignFactory } from '../../../../test/campaignFactory'
import { resolveText } from '../resolveText'
import { toTranslatedValues } from '../translatedValue'

import { translationBatches } from './campaignMachineTranslate'
import { campaignTranslationRows } from './translationRows'

const ENGLISH = '529'
const FRENCH = '496'
const SPANISH = '21028'
const GERMAN = '1106'

describe('campaignTranslationRows', () => {
  const fixture = campaignFactory()
    .withLanguage(FRENCH)
    .withLanguage(SPANISH)
    .withLanguage(GERMAN)
    .withRegion('Europe')
    .build()
  const region = fixture.regions[0]

  it('places every target in the Translations view’s order and group', () => {
    const rows = campaignTranslationRows(fixture, FRENCH)

    const order = rows.map((row) => `${row.group}:${row.target.id}`)
    const firstOf = (key: string): number => order.indexOf(key)
    expect(order[0]).toBe('interface:campaignId')
    expect(firstOf('interface:string-copy')).toBeLessThan(
      firstOf('interface:navHomeId')
    )
    expect(firstOf('interface:navHomeId')).toBeLessThan(
      firstOf('landing:heroId')
    )
    expect(firstOf('landing:heroId')).toBeLessThan(
      firstOf('region:regionHeaderId')
    )
    expect(firstOf('region:regionHeaderId')).toBeLessThan(
      firstOf(`regions:${region.id}`)
    )
    expect(rows[0]).toEqual({
      target: { typename: 'Campaign', kind: 'campaign', id: 'campaignId' },
      group: 'interface',
      field: 'title',
      maxLength: 100,
      defaultValue: 'Outreach 2026',
      value: null,
      source: null,
      needsReview: false
    })
    expect(rows.find((row) => row.target.kind === 'region')?.target).toEqual({
      typename: 'CampaignRegion',
      kind: 'region',
      id: region.id
    })
    expect(rows.find((row) => row.target.kind === 'string')?.target).toEqual(
      expect.objectContaining({ typename: 'CampaignString' })
    )
  })

  it('takes each block’s fields and caps from its typename', () => {
    const rows = campaignTranslationRows(fixture, FRENCH).filter(
      (row) => row.target.id === 'heroId'
    )

    expect(rows.map((row) => [row.field, row.maxLength])).toEqual([
      ['eyebrow', 80],
      ['title', 150],
      ['description', 500]
    ])
    expect(rows[0].target.typename).toBe('CampaignHeroBlock')
  })

  it('leaves out fields with no default-language text and blocks off any visible page', () => {
    const rows = campaignTranslationRows(
      {
        ...fixture,
        blocks: [
          ...fixture.blocks.map((block) =>
            block.id === 'heroId' ? { ...block, eyebrow: '  ' } : block
          ),
          {
            ...fixture.blocks[0],
            id: 'orphanId',
            parentBlockId: 'deletedSectionId'
          }
        ]
      },
      FRENCH
    )

    expect(
      rows.some((row) => row.target.id === 'heroId' && row.field === 'eyebrow')
    ).toBe(false)
    expect(rows.some((row) => row.target.id === 'orphanId')).toBe(false)
  })

  describe('a block whose translations hold an empty, a non-string and an unknown-source entry', () => {
    const titleTranslations = {
      [FRENCH]: { value: '', source: 'machine' },
      [SPANISH]: { value: 42, source: 'machine' },
      [GERMAN]: { value: 'Teile die Geschichte', source: 'robot' }
    }
    const campaign = {
      ...fixture,
      blocks: fixture.blocks.map((block) =>
        block.id === 'heroId' ? { ...block, titleTranslations } : block
      )
    }
    const parentOf = new Map(
      campaign.blocks.map((block) => [block.id, block.parentBlockId])
    )

    function heroTitle(languageId: string): {
      value: string | null
      source: string | null
    } {
      const row = campaignTranslationRows(campaign, languageId).find(
        (candidate) =>
          candidate.target.id === 'heroId' && candidate.field === 'title'
      )
      return { value: row?.value ?? null, source: row?.source ?? null }
    }

    function machineAsksForHeroTitle(languageId: string): boolean {
      return translationBatches(
        campaignTranslationRows(campaign, languageId),
        parentOf,
        'missing'
      ).some((batch) =>
        batch.rows.some(
          (row) => row.target.id === 'heroId' && row.field === 'title'
        )
      )
    }

    it('lists only the unknown-source entry in the GraphQL translations, as human', () => {
      expect(toTranslatedValues(titleTranslations)).toEqual([
        { languageId: GERMAN, value: 'Teile die Geschichte', source: 'human' }
      ])
    })

    it('reads the first two as missing and the third as written (resolveText)', () => {
      expect(
        resolveText('Share the story', titleTranslations, FRENCH, ENGLISH)
      ).toBe('Share the story')
      expect(
        resolveText('Share the story', titleTranslations, SPANISH, ENGLISH)
      ).toBe('Share the story')
      expect(
        resolveText('Share the story', titleTranslations, GERMAN, ENGLISH)
      ).toBe('Teile die Geschichte')
    })

    it('shows the first two as missing and the third as human (Translations rows)', () => {
      expect(heroTitle(FRENCH)).toEqual({ value: null, source: null })
      expect(heroTitle(SPANISH)).toEqual({ value: null, source: null })
      expect(heroTitle(GERMAN)).toEqual({
        value: 'Teile die Geschichte',
        source: 'human'
      })
    })

    it('asks the machine for the first two and never the third (missing)', () => {
      expect(machineAsksForHeroTitle(FRENCH)).toBe(true)
      expect(machineAsksForHeroTitle(SPANISH)).toBe(true)
      expect(machineAsksForHeroTitle(GERMAN)).toBe(false)
    })
  })
})
