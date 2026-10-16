import { CampaignAction, prisma } from '@core/prisma/journeys/client'

import { ButtonSize } from '../../block/button/enums/buttonSize'
import { ButtonVariant } from '../../block/button/enums/buttonVariant'
import { TypographyAlign } from '../../block/typography/enums/typographyAlign'
import { builder } from '../../builder'
import { CampaignActionInterface } from '../action/campaignAction'
import { CampaignChildPlacement } from '../enums'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'

export const CampaignButtonBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignButtonBlock',
  interfaces: [CampaignBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignButtonBlock',
  description:
    'The campaign call-to-action block: a translated label, core button variant and size, optional alignment and two hex colours, and at most one CampaignAction. Corner shape belongs to the Campaign Theme.',
  fields: (t) => ({
    label: t.string({
      nullable: false,
      resolve: (block) => block.label ?? ''
    }),
    labelTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.labelTranslations)
    }),
    variant: t.field({
      type: ButtonVariant,
      nullable: true,
      description: 'Null means contained.',
      resolve: (block) => block.buttonVariant
    }),
    size: t.field({
      type: ButtonSize,
      nullable: true,
      description: 'Null means medium.',
      resolve: (block) => block.buttonSize
    }),
    align: t.field({
      type: TypographyAlign,
      nullable: true,
      description: 'Null means follow the section.',
      resolve: (block) => block.align
    }),
    color: t.exposeString('color', {
      nullable: true,
      description:
        'Fill (contained) or border and label (outlined). Null means the section buttonColor, then the theme primary.'
    }),
    labelColor: t.exposeString('labelColor', {
      nullable: true,
      description:
        'Label colour for contained. Null means the section buttonTextColor, then on-primary.'
    }),
    placement: t.expose('placement', {
      type: CampaignChildPlacement,
      nullable: true
    }),
    // Reads the action a parent list preloaded (the admin `blocks` list and
    // `campaignPublic` both include it) and only queries when the row arrived
    // bare, so no public read pays a second query per button.
    action: t.field({
      type: CampaignActionInterface,
      nullable: true,
      resolve: async (block) => {
        if ('action' in block)
          return (block as { action: CampaignAction | null }).action
        return await prisma.campaignAction.findUnique({
          where: { campaignBlockId: block.id }
        })
      }
    })
  })
})
