import { InMemoryCache } from '@apollo/client'
import { parse } from 'graphql'

import {
  campaignBlockDeleteUpdate,
  campaignBlockInsertUpdate
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
