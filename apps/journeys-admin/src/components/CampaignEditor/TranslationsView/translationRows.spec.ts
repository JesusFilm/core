import {
  featuredMediaSectionBlock,
  imageSectionBlock,
  muxVideoBlock
} from '@core/journeys/ui/Campaign/testData'

import { campaign } from '../data'

import { campaignTextSignature, rowPlace } from './translationRows'

type Block = (typeof campaign.blocks)[number]

/** The fixture campaign with a carousel card and an image beside its sections. */
const withMedia = {
  ...campaign,
  blocks: [
    ...campaign.blocks,
    muxVideoBlock as unknown as Block,
    imageSectionBlock as unknown as Block
  ]
}

function withBlock(
  typename: Block['__typename'],
  changes: Record<string, unknown>
): typeof campaign {
  const index = withMedia.blocks.findIndex(
    (block) => block.__typename === typename
  )
  if (index < 0) throw new Error(`no fixture ${typename}`)
  return {
    ...withMedia,
    blocks: withMedia.blocks.map((block, blockIndex) =>
      blockIndex === index ? { ...block, ...changes } : block
    )
  }
}

describe('campaignTextSignature', () => {
  it.each([
    ['CampaignVideoBlock', { title: 'A new card title' }],
    ['CampaignVideoBlock', { description: 'A new card description' }],
    ['CampaignImageBlock', { alt: 'A new alt text' }],
    ['CampaignHeroBlock', { title: 'A new hero title' }]
  ] as const)(
    'changes when a %s text the API translates changes',
    (typename, changes) => {
      expect(campaignTextSignature(withBlock(typename, changes))).not.toBe(
        campaignTextSignature(withMedia)
      )
    }
  )

  it('ignores translations', () => {
    expect(
      campaignTextSignature(
        withBlock('CampaignHeroBlock', { titleTranslations: [] })
      )
    ).toBe(campaignTextSignature(withMedia))
  })
})

describe('rowPlace', () => {
  function stringRow(key: string): Parameters<typeof rowPlace>[0] {
    return {
      target: {
        __typename: 'CampaignTranslationTarget',
        typename: 'CampaignString',
        blockId: null,
        regionId: null,
        stringId: `string-${key}`,
        campaignId: null
      }
    }
  }

  function without(...typenames: string[]): typeof campaign {
    return {
      ...campaign,
      blocks: campaign.blocks.filter(
        (block) => !typenames.includes(block.__typename)
      )
    }
  }

  it('takes an allRegions row to the header, also when the campaign has an Analytics section', () => {
    expect(
      campaign.blocks.some(
        (block) => block.__typename === 'CampaignAnalyticsBlock'
      )
    ).toBe(true)
    expect(rowPlace(stringRow('allRegions'), campaign)).toEqual({
      blockId: 'headerId'
    })
  })

  it('takes an allRegions row to the first Analytics section without a header', () => {
    expect(
      rowPlace(stringRow('allRegions'), without('CampaignHeaderBlock'))
    ).toEqual({ blockId: 'landingAnalyticsId' })
  })

  it('takes a videos row to the carousel', () => {
    expect(rowPlace(stringRow('videos'), campaign)).toEqual({
      blockId: 'carouselId'
    })
  })

  it('takes a videos row to the first Hero without a carousel', () => {
    expect(
      rowPlace(stringRow('videos'), without('CampaignVideoCarouselBlock'))
    ).toEqual({ blockId: 'heroId' })
  })

  it('takes a videos row to the first Featured Media section without a carousel or Hero', () => {
    const featuredMediaOnly = without(
      'CampaignVideoCarouselBlock',
      'CampaignHeroBlock'
    )
    expect(
      rowPlace(stringRow('videos'), {
        ...featuredMediaOnly,
        blocks: [
          ...featuredMediaOnly.blocks,
          featuredMediaSectionBlock as unknown as Block
        ]
      })
    ).toEqual({ blockId: 'featuredMediaId' })
  })

  it('takes a row whose string no section shows to the campaign', () => {
    expect(
      rowPlace(stringRow('videos'), {
        ...campaign,
        blocks: []
      })
    ).toEqual({})
  })
})
