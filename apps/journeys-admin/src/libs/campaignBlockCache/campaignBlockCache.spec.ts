import { InMemoryCache } from '@apollo/client'
import { parse } from 'graphql'

import { campaignBlockInsertUpdate } from './campaignBlockCache'

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
