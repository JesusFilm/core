import { campaignFactory } from '../../../../test/campaignFactory'
import { prismaMock } from '../../../../test/prismaMock'

import {
  countMissingTranslations,
  swapDefaultLanguage,
  swapTargetColumns
} from './defaultLanguageSwap'

const ENGLISH = '529'
const FRENCH = '496'
const SPANISH = '21028'

describe('defaultLanguageSwap', () => {
  describe('swapTargetColumns', () => {
    it('swaps each field with something to move and leaves the rest out', () => {
      expect(
        swapTargetColumns(
          {
            eyebrow: 'Your campaign',
            eyebrowTranslations: {
              [FRENCH]: { value: 'Votre campagne', source: 'machine' }
            },
            title: null,
            titleTranslations: null
          },
          { eyebrow: 80, title: 150 },
          ENGLISH,
          FRENCH
        )
      ).toEqual({
        eyebrow: 'Votre campagne',
        eyebrowTranslations: {
          [ENGLISH]: { value: 'Your campaign', source: 'human' }
        }
      })
    })

    it('leaves the column unchanged when the new default holds a non-string entry', () => {
      expect(
        swapTargetColumns(
          { title: null, titleTranslations: { [FRENCH]: { value: 42 } } },
          { title: 150 },
          ENGLISH,
          FRENCH
        )
      ).toBeNull()
    })

    it('never promotes a non-string entry over the column text', () => {
      expect(
        swapTargetColumns(
          {
            title: 'Share the story',
            titleTranslations: { [FRENCH]: { value: ['x'], source: 'human' } }
          },
          { title: 150 },
          ENGLISH,
          FRENCH
        )
      ).toEqual({
        title: '',
        titleTranslations: {
          [ENGLISH]: { value: 'Share the story', source: 'human' }
        }
      })
    })
  })

  describe('swapDefaultLanguage', () => {
    const fixture = campaignFactory()
      .withLanguage(FRENCH)
      .withRegion('Europe')
      .build()
    const hero = fixture.blocks.find((block) => block.id === 'heroId')!
    const region = fixture.regions[0]
    const copy = fixture.strings.find((string) => string.key === 'copy')!

    /** Every text has a French translation, except a deleted block's. */
    const campaign = {
      ...fixture,
      titleTranslations: { [FRENCH]: { value: 'Campagne', source: 'human' } },
      blocks: [
        {
          ...hero,
          eyebrow: null,
          description: null,
          titleTranslations: {
            [FRENCH]: { value: "Partagez l'histoire", source: 'machine' }
          }
        },
        {
          ...hero,
          id: 'deletedHeroId',
          deletedAt: new Date('2026-10-01T00:00:00.000Z'),
          eyebrow: null,
          description: null,
          title: 'Old title',
          titleTranslations: null
        }
      ],
      strings: [
        {
          ...copy,
          valueTranslations: {
            [FRENCH]: { value: 'Copier le lien', source: 'human' }
          }
        }
      ],
      regions: [
        {
          ...region,
          nameTranslations: { [FRENCH]: { value: 'Europe', source: 'human' } }
        }
      ]
    }

    beforeEach(() => {
      vi.clearAllMocks()
      prismaMock.campaign.findUniqueOrThrow.mockResolvedValue(campaign)
    })

    it('swaps every target and returns the campaign’s own columns', async () => {
      await expect(
        swapDefaultLanguage(prismaMock, 'campaignId', FRENCH)
      ).resolves.toEqual({
        title: 'Campagne',
        titleTranslations: {
          [ENGLISH]: { value: 'Outreach 2026', source: 'human' }
        }
      })

      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'heroId' },
        data: {
          title: "Partagez l'histoire",
          titleTranslations: {
            [ENGLISH]: { value: 'Share the story', source: 'human' }
          }
        }
      })
      expect(prismaMock.campaignString.update).toHaveBeenCalledWith({
        where: { id: copy.id },
        data: {
          value: 'Copier le lien',
          valueTranslations: {
            [ENGLISH]: { value: copy.value, source: 'human' }
          }
        }
      })
      expect(prismaMock.campaignRegion.update).toHaveBeenCalledWith({
        where: { id: region.id },
        data: {
          name: 'Europe',
          nameTranslations: { [ENGLISH]: { value: 'Europe', source: 'human' } }
        }
      })
      expect(prismaMock.campaign.update).not.toHaveBeenCalled()
    })

    it('blanks a deleted block with no translation and moves its text under the old default', async () => {
      await swapDefaultLanguage(prismaMock, 'campaignId', FRENCH)

      expect(prismaMock.campaignBlock.update).toHaveBeenCalledWith({
        where: { id: 'deletedHeroId' },
        data: {
          title: '',
          titleTranslations: {
            [ENGLISH]: { value: 'Old title', source: 'human' }
          }
        }
      })
    })

    it('refuses a language the campaign does not have (BAD_USER_INPUT, defaultLanguageId)', async () => {
      await expect(
        swapDefaultLanguage(prismaMock, 'campaignId', SPANISH)
      ).rejects.toMatchObject({
        extensions: { code: 'BAD_USER_INPUT', field: 'defaultLanguageId' }
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('does nothing when the language is already the default', async () => {
      await expect(
        swapDefaultLanguage(prismaMock, 'campaignId', ENGLISH)
      ).resolves.toEqual({})
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })

    it('refuses while a live text has no translation (CONFLICT with the count)', async () => {
      prismaMock.campaign.findUniqueOrThrow.mockResolvedValue({
        ...campaign,
        titleTranslations: { [FRENCH]: { value: '', source: 'machine' } }
      })

      await expect(
        swapDefaultLanguage(prismaMock, 'campaignId', FRENCH)
      ).rejects.toMatchObject({
        extensions: {
          code: 'CONFLICT',
          field: 'defaultLanguageId',
          count: 1
        }
      })
      expect(prismaMock.campaignBlock.update).not.toHaveBeenCalled()
    })
  })

  describe('countMissingTranslations', () => {
    it('counts the texts with default-language text and no translation', () => {
      const campaign = campaignFactory().withLanguage(FRENCH).build()

      const all = countMissingTranslations(campaign, FRENCH)
      const withTitle = countMissingTranslations(
        {
          ...campaign,
          titleTranslations: { [FRENCH]: { value: 'Campagne' } }
        },
        FRENCH
      )

      expect(all).toBeGreaterThan(0)
      expect(withTitle).toBe(all - 1)
    })
  })
})
