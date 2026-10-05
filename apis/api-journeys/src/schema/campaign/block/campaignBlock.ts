import { builder } from '../../builder'

/**
 * The Campaign counterpart of Block: every node of a Campaign's content tree,
 * resolved to its concrete typename by the `typename` column.
 */
export const CampaignBlock = builder.prismaInterface('CampaignBlock', {
  name: 'CampaignBlock',
  description:
    'A node in a Campaign content tree. One table discriminated by typename; every row is scoped to its Campaign and to at most one of a Campaign Page or a Campaign Region (neither set means Campaign Chrome). Children copy the parent scoping down.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    campaignId: t.exposeID('campaignId', { nullable: false }),
    pageId: t.exposeID('pageId', {
      nullable: true,
      description: 'The Campaign Page this block sits on, if page-scoped.'
    }),
    regionId: t.exposeID('regionId', {
      nullable: true,
      description:
        'The Campaign Region this block belongs to, if region-scoped (a Region Line).'
    }),
    parentBlockId: t.exposeID('parentBlockId', { nullable: true }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      description:
        'Order among siblings. Null on an owned block (a cover, logo or media slot).'
    })
  }),
  resolveType: (block) => block.typename
})
