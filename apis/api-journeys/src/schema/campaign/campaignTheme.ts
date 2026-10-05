import { ThemeMode } from '../block/card/enums/themeMode'
import { builder } from '../builder'

import { CampaignButtonRadius, CampaignRadius } from './enums'

export const CampaignThemeRef = builder.prismaObject('CampaignTheme', {
  description:
    'The one look-and-feel row every Campaign has: theme mode, the three font roles, six base colours, two contrast-band colours, corner radius and button shape. Text over a coloured band is computed for contrast, never stored. Nothing records which Theme Preset is active.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    campaignId: t.exposeID('campaignId', { nullable: false }),
    themeMode: t.expose('themeMode', { type: ThemeMode, nullable: false }),
    headerFont: t.exposeString('headerFont', {
      nullable: true,
      description: 'Google Fonts family; null = the base theme default.'
    }),
    bodyFont: t.exposeString('bodyFont', { nullable: true }),
    labelFont: t.exposeString('labelFont', { nullable: true }),
    primaryColor: t.exposeString('primaryColor', { nullable: false }),
    accentColor: t.exposeString('accentColor', { nullable: false }),
    backgroundColor: t.exposeString('backgroundColor', { nullable: false }),
    surfaceColor: t.exposeString('surfaceColor', { nullable: false }),
    textColor: t.exposeString('textColor', { nullable: false }),
    mutedColor: t.exposeString('mutedColor', { nullable: false }),
    contrastBackgroundColor: t.exposeString('contrastBackgroundColor', {
      nullable: false
    }),
    contrastTextColor: t.exposeString('contrastTextColor', {
      nullable: false
    }),
    radius: t.expose('radius', { type: CampaignRadius, nullable: false }),
    buttonRadius: t.expose('buttonRadius', {
      type: CampaignButtonRadius,
      nullable: false
    }),
    createdAt: t.expose('createdAt', { type: 'DateTimeISO', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTimeISO', nullable: false })
  })
})
