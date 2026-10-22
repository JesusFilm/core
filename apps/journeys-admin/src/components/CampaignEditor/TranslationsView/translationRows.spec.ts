import {
  imageSectionBlock,
  muxVideoBlock
} from '@core/journeys/ui/Campaign/testData'

import { campaign } from '../data'

import { campaignTextSignature } from './translationRows'

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
