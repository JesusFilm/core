import { CampaignFlatBlock, transformCampaignBlocks } from './transformer'

function block(
  id: string,
  parentBlockId: string | null,
  parentOrder: number | null,
  extra: Partial<CampaignFlatBlock> & { __typename?: string } = {}
): CampaignFlatBlock {
  return {
    __typename: extra.__typename ?? 'CampaignTypographyBlock',
    id,
    parentBlockId,
    parentOrder,
    ...extra
  }
}

describe('transformCampaignBlocks', () => {
  it('trees the flat list by parentBlockId ordered by parentOrder', () => {
    const tree = transformCampaignBlocks([
      block('button', 'hero', 1, { __typename: 'CampaignButtonBlock' }),
      block('switcher', null, 1, { __typename: 'CampaignRegionSwitcherBlock' }),
      block('hero', null, 0, { __typename: 'CampaignHeroBlock' }),
      block('line', 'hero', 0)
    ])

    expect(tree.map((node) => node.id)).toEqual(['hero', 'switcher'])
    expect(tree[0].children.map((node) => node.id)).toEqual(['line', 'button'])
    expect(tree[1].children).toEqual([])
  })

  it('attaches owned blocks (parentOrder null) through their slot column, not as children', () => {
    const tree = transformCampaignBlocks([
      block('hero', null, 0, {
        __typename: 'CampaignHeroBlock',
        mediaBlockId: 'media',
        coverBlockId: 'cover'
      }),
      block('media', 'hero', null, { __typename: 'CampaignImageBlock' }),
      block('cover', 'hero', null, { __typename: 'CampaignImageBlock' }),
      block('header', null, 0, {
        __typename: 'CampaignHeaderBlock',
        logoBlockId: 'logo'
      }),
      block('logo', 'header', null, { __typename: 'CampaignImageBlock' })
    ])

    const hero = tree.find((node) => node.id === 'hero')
    expect(hero?.children).toEqual([])
    expect(hero?.media?.id).toBe('media')
    expect(hero?.cover?.id).toBe('cover')
    const header = tree.find((node) => node.id === 'header')
    expect(header?.logo?.id).toBe('logo')
    expect(tree.map((node) => node.id)).toEqual(['hero', 'header'])
  })

  it('drops soft-deleted rows and their subtree', () => {
    const tree = transformCampaignBlocks([
      block('hero', null, 0, { __typename: 'CampaignHeroBlock' }),
      block('gone', null, 1, {
        __typename: 'CampaignHeroBlock',
        deletedAt: '2026-10-05T00:00:00.000Z'
      }),
      block('orphan', 'gone', 0),
      block('kept', 'hero', 0, { deletedAt: null })
    ])

    expect(tree.map((node) => node.id)).toEqual(['hero'])
    expect(tree[0].children.map((node) => node.id)).toEqual(['kept'])
  })

  it('leaves an owned slot empty when the owned row is missing', () => {
    const tree = transformCampaignBlocks([
      block('hero', null, 0, { __typename: 'CampaignHeroBlock', mediaBlockId: 'missing' })
    ])
    expect(tree[0].media).toBeNull()
  })
})
