import { prismaMock } from '../../../../test/prismaMock'

import {
  CAMPAIGN_BLOCK_TEXT_FIELDS,
  CAMPAIGN_REGION_TEXT_FIELDS,
  CAMPAIGN_STRING_TEXT_FIELDS,
  CAMPAIGN_TITLE_TEXT_FIELDS
} from './textFields'
import {
  INCLUDE_TARGET_CAMPAIGN,
  TRANSLATION_TARGETS,
  TranslationTargetKind
} from './translationTarget'

const MODELS = {
  block: { delegate: 'campaignBlock' },
  region: { delegate: 'campaignRegion' },
  string: { delegate: 'campaignString' },
  campaign: { delegate: 'campaign' }
} as const

const KINDS = Object.keys(MODELS) as TranslationTargetKind[]

describe('TRANSLATION_TARGETS', () => {
  it.each(KINDS)('%s writes translations to its own model', async (kind) => {
    const data = { titleTranslations: { fr: { value: 'x', source: 'human' } } }
    await TRANSLATION_TARGETS[kind].update(prismaMock, 'id', data as never)

    expect(prismaMock[MODELS[kind].delegate].update).toHaveBeenCalledWith({
      where: { id: 'id' },
      data
    })
  })

  it.each(KINDS)('%s selects columns by id', async (kind) => {
    await TRANSLATION_TARGETS[kind].select(prismaMock, 'id', {
      titleTranslations: true
    })

    expect(prismaMock[MODELS[kind].delegate].findUnique).toHaveBeenCalledWith({
      where: { id: 'id' },
      select: { titleTranslations: true }
    })
  })

  it('reads only a live block', async () => {
    await TRANSLATION_TARGETS.block.find(prismaMock, 'id')
    await TRANSLATION_TARGETS.block.findWithCampaign(prismaMock, 'id')

    expect(prismaMock.campaignBlock.findFirst).toHaveBeenNthCalledWith(1, {
      where: { id: 'id', deletedAt: null }
    })
    expect(prismaMock.campaignBlock.findFirst).toHaveBeenNthCalledWith(2, {
      where: { id: 'id', deletedAt: null },
      include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
    })
  })

  it.each(['region', 'string'] as const)(
    '%s reads by id with its campaign',
    async (kind) => {
      const campaign = { id: 'campaignId' }
      const row = { id: 'id', campaign }
      prismaMock[MODELS[kind].delegate].findUnique.mockResolvedValue(
        row as never
      )

      await expect(
        TRANSLATION_TARGETS[kind].findWithCampaign(prismaMock, 'id')
      ).resolves.toEqual({ row, campaign })
      expect(prismaMock[MODELS[kind].delegate].findUnique).toHaveBeenCalledWith(
        {
          where: { id: 'id' },
          include: { campaign: { include: INCLUDE_TARGET_CAMPAIGN } }
        }
      )
    }
  )

  it('reads the campaign target as its own campaign', async () => {
    const campaign = { id: 'campaignId' }
    prismaMock.campaign.findUnique.mockResolvedValue(campaign as never)

    await expect(
      TRANSLATION_TARGETS.campaign.findWithCampaign(prismaMock, 'campaignId')
    ).resolves.toEqual({ row: campaign, campaign })
    expect(prismaMock.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: 'campaignId' },
      include: INCLUDE_TARGET_CAMPAIGN
    })
  })

  it('is null when the target does not resolve', async () => {
    prismaMock.campaignBlock.findFirst.mockResolvedValue(null)

    await expect(
      TRANSLATION_TARGETS.block.findWithCampaign(prismaMock, 'gone')
    ).resolves.toBeNull()
  })

  it('takes the text caps of the target', () => {
    expect(
      TRANSLATION_TARGETS.block.caps({ typename: 'CampaignHeroBlock' })
    ).toBe(CAMPAIGN_BLOCK_TEXT_FIELDS.CampaignHeroBlock)
    expect(TRANSLATION_TARGETS.block.caps({ typename: 'Unknown' })).toEqual({})
    expect(TRANSLATION_TARGETS.region.caps({})).toBe(
      CAMPAIGN_REGION_TEXT_FIELDS
    )
    expect(TRANSLATION_TARGETS.string.caps({})).toBe(
      CAMPAIGN_STRING_TEXT_FIELDS
    )
    expect(TRANSLATION_TARGETS.campaign.caps({})).toBe(
      CAMPAIGN_TITLE_TEXT_FIELDS
    )
  })
})
