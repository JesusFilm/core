import { InMemoryCache } from '@apollo/client'
import { parse } from 'graphql'

import { LANDING_PAGE_ID } from '@core/journeys/ui/Campaign/testData'

import { campaign } from '../../components/CampaignEditor/data'
import { campaignCache } from '../../components/CampaignEditor/testing'
import { GET_CAMPAIGN } from '../useCampaignQuery'

import {
  campaignBlockCreateUpdate,
  campaignBlockDeleteUpdate,
  campaignBlockInsertUpdate,
  campaignBlockRestoreUpdate,
  campaignBlockSlotWrite,
  campaignBlocksAdd,
  campaignBlocksInsert,
  campaignBlocksRemove,
  campaignBlocksReorder
} from './campaignBlockCache'

const BLOCKS = parse(`
  query Blocks($id: ID!) {
    campaign(id: $id) {
      id
      blocks {
        id
        pageId
        regionId
        parentBlockId
        parentOrder
      }
    }
  }
`)

const columns = {
  __typename: 'CampaignColumnsBlock',
  id: 'columns',
  pageId: 'page',
  regionId: null,
  parentBlockId: null,
  parentOrder: 0
}
const slot = {
  __typename: 'CampaignColumnBlock',
  id: 'slot',
  pageId: 'page',
  regionId: null,
  parentBlockId: 'columns',
  parentOrder: 0
}

function seededCache(): InMemoryCache {
  const cache = new InMemoryCache()
  cache.writeQuery({
    query: BLOCKS,
    variables: { id: 'campaign' },
    data: {
      campaign: {
        __typename: 'Campaign',
        id: 'campaign',
        blocks: [columns, slot]
      }
    }
  })
  return cache
}

function cachedBlocks(
  cache: InMemoryCache
): Array<{ id: string; parentBlockId: string | null }> {
  return (
    cache.readQuery<{
      campaign: { blocks: Array<{ id: string; parentBlockId: string | null }> }
    }>({ query: BLOCKS, variables: { id: 'campaign' } })?.campaign.blocks ?? []
  )
}

describe('campaignBlockInsertUpdate', () => {
  it('places a block with a parentBlockId under its slot without a refetch', () => {
    const cache = seededCache()
    const child = {
      __typename: 'CampaignRichTextBlock',
      id: 'child',
      pageId: 'page',
      regionId: null,
      parentBlockId: 'slot',
      parentOrder: 0
    }
    cache.writeQuery({
      query: parse(`
        query Child {
          block {
            id
            pageId
            regionId
            parentBlockId
            parentOrder
          }
        }
      `),
      data: { block: child }
    })

    campaignBlockInsertUpdate(cache, 'campaign', child)

    expect(cachedBlocks(cache)).toContainEqual(
      expect.objectContaining({ id: 'child', parentBlockId: 'slot' })
    )
  })
})

describe('campaignBlockDeleteUpdate', () => {
  const SECTION_BLOCKS = parse(`
    query SectionBlocks($id: ID!) {
      campaign(id: $id) {
        id
        blocks {
          id
          pageId
          regionId
          parentBlockId
          parentOrder
          ... on CampaignHeroBlock {
            coverBlockId
            mediaBlockId
          }
        }
      }
    }
  `)

  function block(
    __typename: string,
    id: string,
    parentBlockId: string | null,
    parentOrder: number | null
  ): Record<string, unknown> {
    return {
      __typename,
      id,
      pageId: 'page',
      regionId: null,
      parentBlockId,
      parentOrder
    }
  }

  function sectionCache(): InMemoryCache {
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: SECTION_BLOCKS,
      variables: { id: 'campaign' },
      data: {
        campaign: {
          __typename: 'Campaign',
          id: 'campaign',
          blocks: [
            {
              ...block('CampaignHeroBlock', 'hero', null, 0),
              coverBlockId: 'cover',
              // Owned through the slot column alone.
              mediaBlockId: 'media'
            },
            block('CampaignButtonBlock', 'heroButton', 'hero', 0),
            block('CampaignImageBlock', 'cover', 'hero', null),
            block('CampaignVideoBlock', 'media', null, null),
            {
              ...block('CampaignHeroBlock', 'nextHero', null, 1),
              coverBlockId: null,
              mediaBlockId: null
            },
            block('CampaignButtonBlock', 'nextHeroButton', 'nextHero', 0)
          ]
        }
      }
    })
    return cache
  }

  function cachedIds(cache: InMemoryCache): string[] {
    return (
      cache
        .readQuery<{
          campaign: { blocks: Array<{ id: string }> }
        }>({ query: SECTION_BLOCKS, variables: { id: 'campaign' } })
        ?.campaign.blocks.map(({ id }) => id) ?? []
    )
  }

  it('drops a deleted section with its nested Extra and its owned blocks, keeping the rows cached', () => {
    const cache = sectionCache()

    campaignBlockDeleteUpdate(cache, 'campaign', 'hero', [
      { __typename: 'CampaignHeroBlock', id: 'nextHero', parentOrder: 0 }
    ])

    expect(cachedIds(cache)).toEqual(['nextHero', 'nextHeroButton'])
    expect(cache.extract()['CampaignImageBlock:cover']).toMatchObject({
      id: 'cover'
    })
  })
})

describe('campaign block cache on the seeded campaign', () => {
  const BLOCK_ROWS = parse(`
    query CampaignBlockRows($id: ID!) {
      campaign(id: $id) {
        id
        blocks {
          id
          pageId
          regionId
          parentBlockId
          parentOrder
        }
      }
    }
  `)

  const BLOCK_ORDER = parse(`
    fragment CampaignBlockOrder on CampaignBlock {
      id
      parentOrder
    }
  `)

  const NEW_BLOCK = parse(`
    fragment NewCampaignBlock on CampaignBlock {
      id
      pageId
      regionId
      parentBlockId
      parentOrder
    }
  `)

  type BlockRow = {
    id: string
    pageId: string | null
    regionId: string | null
    parentBlockId: string | null
    parentOrder: number | null
  }

  function seededCampaignCache(): InMemoryCache {
    const cache = campaignCache()
    cache.writeQuery({
      query: GET_CAMPAIGN,
      variables: { id: campaign.id },
      data: { campaign }
    })
    return cache
  }

  function blockRows(cache: InMemoryCache): BlockRow[] {
    return (
      cache.readQuery<{ campaign: { blocks: BlockRow[] } }>({
        query: BLOCK_ROWS,
        variables: { id: campaign.id }
      })?.campaign.blocks ?? []
    )
  }

  function blockIds(cache: InMemoryCache): string[] {
    return blockRows(cache).map(({ id }) => id)
  }

  function parentOrderOf(
    cache: InMemoryCache,
    __typename: string,
    id: string
  ): number | null | undefined {
    return cache.readFragment<{ id: string; parentOrder: number | null }>({
      id: cache.identify({ __typename, id }),
      fragment: BLOCK_ORDER
    })?.parentOrder
  }

  const newButton = {
    __typename: 'CampaignButtonBlock',
    id: 'newButtonId',
    pageId: LANDING_PAGE_ID,
    regionId: null,
    parentBlockId: 'heroId',
    parentOrder: 1
  }

  function writeBlockRow(
    cache: InMemoryCache,
    block: BlockRow & { __typename: string }
  ): void {
    cache.writeFragment({
      id: cache.identify(block),
      fragment: NEW_BLOCK,
      data: block
    })
  }

  describe('campaignBlocksAdd', () => {
    it('appends a cached block to the end of Campaign.blocks', () => {
      const cache = seededCampaignCache()
      writeBlockRow(cache, newButton)

      campaignBlocksAdd(cache, campaign.id, [newButton])

      const ids = blockIds(cache)
      expect(ids).toHaveLength(campaign.blocks.length + 1)
      expect(ids.at(-1)).toBe('newButtonId')
    })

    it('skips blocks that are already listed', () => {
      const cache = seededCampaignCache()
      writeBlockRow(cache, newButton)
      campaignBlocksAdd(cache, campaign.id, [newButton])

      campaignBlocksAdd(cache, campaign.id, [
        { __typename: 'CampaignHeroBlock', id: 'heroId' },
        newButton
      ])

      const ids = blockIds(cache)
      expect(ids).toHaveLength(campaign.blocks.length + 1)
      expect(ids.filter((id) => id === 'heroId')).toHaveLength(1)
      expect(ids.filter((id) => id === 'newButtonId')).toHaveLength(1)
    })
  })

  describe('campaignBlocksRemove', () => {
    it('drops a section with every block nested under it and leaves its siblings', () => {
      const cache = seededCampaignCache()

      campaignBlocksRemove(cache, campaign.id, 'landingJourneyListId')

      const ids = blockIds(cache)
      expect(ids).not.toContain('landingJourneyListId')
      expect(ids).not.toContain('journeyListNoteId')
      expect(ids).not.toContain('landingJourneyId')
      expect(ids).not.toContain('landingDraftJourneyId')
      expect(ids).toContain('carouselId')
      expect(ids).toContain('landingAnalyticsId')
      expect(ids).toHaveLength(campaign.blocks.length - 4)
    })

    it('drops only the block itself when nothing is nested under it', () => {
      const cache = seededCampaignCache()

      campaignBlocksRemove(cache, campaign.id, 'heroButtonId')

      expect(blockIds(cache)).toEqual(
        campaign.blocks
          .map(({ id }) => id)
          .filter((id) => id !== 'heroButtonId')
      )
    })

    it('keeps the removed rows in the cache', () => {
      const cache = seededCampaignCache()

      campaignBlocksRemove(cache, campaign.id, 'landingJourneyListId')

      expect(
        parentOrderOf(cache, 'CampaignJourneyListBlock', 'landingJourneyListId')
      ).toBe(3)
    })
  })

  describe('campaignBlocksReorder', () => {
    it('writes each parentOrder onto its row', () => {
      const cache = seededCampaignCache()

      campaignBlocksReorder(cache, [
        {
          __typename: 'CampaignVideoCarouselBlock',
          id: 'carouselId',
          parentOrder: 1
        },
        {
          __typename: 'CampaignRegionSwitcherBlock',
          id: 'landingSwitcherId',
          parentOrder: 2
        }
      ])

      expect(
        parentOrderOf(cache, 'CampaignVideoCarouselBlock', 'carouselId')
      ).toBe(1)
      expect(
        parentOrderOf(cache, 'CampaignRegionSwitcherBlock', 'landingSwitcherId')
      ).toBe(2)
      expect(parentOrderOf(cache, 'CampaignHeroBlock', 'heroId')).toBe(0)
    })

    it('leaves the order of Campaign.blocks unchanged', () => {
      const cache = seededCampaignCache()

      campaignBlocksReorder(cache, [
        { __typename: 'CampaignHeroBlock', id: 'heroId', parentOrder: 4 }
      ])

      expect(blockIds(cache)).toEqual(campaign.blocks.map(({ id }) => id))
    })
  })

  describe('campaignBlockCreateUpdate', () => {
    it('lists the created block', () => {
      const cache = seededCampaignCache()
      writeBlockRow(cache, newButton)

      campaignBlockCreateUpdate(cache, campaign.id, newButton)

      expect(blockRows(cache)).toContainEqual(
        expect.objectContaining({ id: 'newButtonId', parentBlockId: 'heroId' })
      )
    })

    it('leaves Campaign.blocks unchanged when the mutation returned no block', () => {
      const cache = seededCampaignCache()

      campaignBlockCreateUpdate(cache, campaign.id, null)

      expect(blockIds(cache)).toEqual(campaign.blocks.map(({ id }) => id))
    })
  })

  describe('campaignBlockDeleteUpdate', () => {
    it('renumbers the siblings and unlists the deleted block, keeping its row cached', () => {
      const cache = seededCampaignCache()

      campaignBlockDeleteUpdate(cache, campaign.id, 'carouselId', [
        {
          __typename: 'CampaignJourneyListBlock',
          id: 'landingJourneyListId',
          parentOrder: 2
        },
        {
          __typename: 'CampaignAnalyticsBlock',
          id: 'landingAnalyticsId',
          parentOrder: 3
        }
      ])

      expect(blockIds(cache)).not.toContain('carouselId')
      expect(
        parentOrderOf(cache, 'CampaignJourneyListBlock', 'landingJourneyListId')
      ).toBe(2)
      expect(
        parentOrderOf(cache, 'CampaignAnalyticsBlock', 'landingAnalyticsId')
      ).toBe(3)
      expect(
        parentOrderOf(cache, 'CampaignVideoCarouselBlock', 'carouselId')
      ).toBe(2)
    })

    it('leaves the cache unchanged when the mutation returned no siblings', () => {
      const cache = seededCampaignCache()

      campaignBlockDeleteUpdate(cache, campaign.id, 'carouselId', null)

      expect(blockIds(cache)).toContain('carouselId')
    })
  })

  describe('campaignBlockRestoreUpdate', () => {
    it('relists a deleted block and its siblings at the orders the API returned', () => {
      const cache = seededCampaignCache()
      campaignBlockDeleteUpdate(cache, campaign.id, 'carouselId', [
        {
          __typename: 'CampaignJourneyListBlock',
          id: 'landingJourneyListId',
          parentOrder: 2
        },
        {
          __typename: 'CampaignAnalyticsBlock',
          id: 'landingAnalyticsId',
          parentOrder: 3
        }
      ])

      campaignBlockRestoreUpdate(cache, campaign.id, [
        {
          __typename: 'CampaignVideoCarouselBlock',
          id: 'carouselId',
          parentOrder: 2
        },
        {
          __typename: 'CampaignJourneyListBlock',
          id: 'landingJourneyListId',
          parentOrder: 3
        },
        {
          __typename: 'CampaignAnalyticsBlock',
          id: 'landingAnalyticsId',
          parentOrder: 4
        }
      ])

      const ids = blockIds(cache)
      expect(ids.filter((id) => id === 'carouselId')).toHaveLength(1)
      expect(ids.filter((id) => id === 'landingJourneyListId')).toHaveLength(1)
      expect(
        parentOrderOf(cache, 'CampaignJourneyListBlock', 'landingJourneyListId')
      ).toBe(3)
      expect(
        parentOrderOf(cache, 'CampaignAnalyticsBlock', 'landingAnalyticsId')
      ).toBe(4)
    })

    it('leaves the cache unchanged when the mutation returned no blocks', () => {
      const cache = seededCampaignCache()
      campaignBlocksRemove(cache, campaign.id, 'carouselId')

      campaignBlockRestoreUpdate(cache, campaign.id, undefined)

      expect(blockIds(cache)).not.toContain('carouselId')
    })
  })

  describe('campaignBlocksInsert', () => {
    const insertedSection = {
      __typename: 'CampaignRichTextBlock',
      id: 'insertedSectionId',
      pageId: LANDING_PAGE_ID,
      regionId: null,
      parentBlockId: null,
      parentOrder: 2
    }

    it('lists the block and shifts its later siblings down by one', () => {
      const cache = seededCampaignCache()
      writeBlockRow(cache, insertedSection)

      campaignBlocksInsert(cache, campaign.id, insertedSection)

      expect(blockIds(cache).at(-1)).toBe('insertedSectionId')
      expect(parentOrderOf(cache, 'CampaignHeroBlock', 'heroId')).toBe(0)
      expect(
        parentOrderOf(cache, 'CampaignRegionSwitcherBlock', 'landingSwitcherId')
      ).toBe(1)
      expect(
        parentOrderOf(cache, 'CampaignVideoCarouselBlock', 'carouselId')
      ).toBe(3)
      expect(
        parentOrderOf(cache, 'CampaignJourneyListBlock', 'landingJourneyListId')
      ).toBe(4)
      expect(
        parentOrderOf(cache, 'CampaignAnalyticsBlock', 'landingAnalyticsId')
      ).toBe(5)
      expect(
        parentOrderOf(cache, 'CampaignRichTextBlock', 'insertedSectionId')
      ).toBe(2)
    })

    it('leaves blocks on other pages and under other parents in place', () => {
      const cache = seededCampaignCache()
      writeBlockRow(cache, { ...insertedSection, parentOrder: 0 })

      campaignBlocksInsert(cache, campaign.id, {
        ...insertedSection,
        parentOrder: 0
      })

      expect(
        parentOrderOf(cache, 'CampaignRegionHeaderBlock', 'regionHeaderId')
      ).toBe(0)
      expect(parentOrderOf(cache, 'CampaignButtonBlock', 'heroButtonId')).toBe(
        0
      )
      expect(parentOrderOf(cache, 'CampaignHeaderBlock', 'headerId')).toBe(0)
      expect(parentOrderOf(cache, 'CampaignHeroBlock', 'heroId')).toBe(1)
    })

    it('shifts nothing when the block is appended after its last sibling', () => {
      const cache = seededCampaignCache()
      const appended = { ...insertedSection, parentOrder: 5 }
      writeBlockRow(cache, appended)

      campaignBlocksInsert(cache, campaign.id, appended)

      expect(blockIds(cache).at(-1)).toBe('insertedSectionId')
      expect(
        parentOrderOf(cache, 'CampaignAnalyticsBlock', 'landingAnalyticsId')
      ).toBe(4)
    })

    it('does not list a block twice', () => {
      const cache = seededCampaignCache()
      writeBlockRow(cache, insertedSection)

      campaignBlocksInsert(cache, campaign.id, insertedSection)
      campaignBlocksInsert(cache, campaign.id, insertedSection)

      expect(
        blockIds(cache).filter((id) => id === 'insertedSectionId')
      ).toHaveLength(1)
    })
  })

  describe('campaignBlockInsertUpdate', () => {
    it('leaves the cache unchanged when the mutation returned no block', () => {
      const cache = seededCampaignCache()

      campaignBlockInsertUpdate(cache, campaign.id, null)

      expect(blockRows(cache)).toEqual(blockRows(seededCampaignCache()))
    })
  })

  describe('campaignBlockSlotWrite', () => {
    const HEADER_LOGO = parse(`
      fragment HeaderLogo on CampaignHeaderBlock {
        id
        logoBlockId
      }
    `)

    it("points the owner's slot column at the block", () => {
      const cache = seededCampaignCache()

      campaignBlockSlotWrite(
        cache,
        { __typename: 'CampaignHeaderBlock', id: 'headerId' },
        'logoBlockId',
        'logoImageId'
      )

      expect(
        cache.readFragment<{ id: string; logoBlockId: string | null }>({
          id: cache.identify({
            __typename: 'CampaignHeaderBlock',
            id: 'headerId'
          }),
          fragment: HEADER_LOGO
        })
      ).toEqual({
        __typename: 'CampaignHeaderBlock',
        id: 'headerId',
        logoBlockId: 'logoImageId'
      })
    })
  })
})
