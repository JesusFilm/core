import { builder } from '../../builder'
import { CampaignBackgroundKind, CampaignBackgroundOverlay } from '../enums'

/**
 * The nine shared section fields (Section Background and colour overrides),
 * implemented by every section typename and both chrome typenames, so the
 * section contract lives in one place.
 *
 * This interface deliberately does NOT declare `implements CampaignBlock`,
 * although every implementor also implements CampaignBlock: the legacy
 * `apollo client:codegen` CLI behind five frontend codegen targets fails at
 * schema load on interface-implements-interface syntax (graphql-js 14), the
 * same all-or-nothing failure as `@deprecated` on an input field. The six
 * CampaignBlock fields are repeated here instead, so a fragment on
 * CampaignSectionBlock still reads the whole section shape.
 */
export const CampaignSectionBlock = builder.prismaInterface('CampaignBlock', {
  variant: 'CampaignSectionBlock',
  description:
    'A Campaign Block that renders as a full-width band: every Campaign Section and the two Campaign Chrome blocks. Carries the CampaignBlock fields plus the Section Background and the five colour overrides (null = inherit from the background cascade). Every implementor also implements CampaignBlock.',
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
    }),
    backgroundKind: t.expose('backgroundKind', {
      type: CampaignBackgroundKind,
      nullable: false
    }),
    backgroundColor: t.exposeString('backgroundColor', {
      nullable: true,
      description: 'Read only when backgroundKind is `custom`. `#RRGGBB`.'
    }),
    coverBlockId: t.exposeID('coverBlockId', {
      nullable: true,
      description:
        'The owned CampaignImageBlock; read only when backgroundKind is `image`.'
    }),
    backgroundOverlay: t.expose('backgroundOverlay', {
      type: CampaignBackgroundOverlay,
      nullable: true,
      description: 'Read only when backgroundKind is `image`; null means medium.'
    }),
    headingColor: t.exposeString('headingColor', { nullable: true }),
    textColor: t.exposeString('textColor', { nullable: true }),
    buttonColor: t.exposeString('buttonColor', { nullable: true }),
    buttonTextColor: t.exposeString('buttonTextColor', { nullable: true }),
    accentColor: t.exposeString('accentColor', { nullable: true })
  }),
  resolveType: (block) => block.typename
})
