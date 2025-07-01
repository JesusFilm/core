import { builder } from '../../builder'
import { Block } from '../block'

import {
  TypographyAlign,
  type TypographyAlignType
} from './enums/typographyAlign'
import {
  TypographyColor,
  type TypographyColorType
} from './enums/typographyColor'
import {
  TypographyVariant,
  type TypographyVariantType
} from './enums/typographyVariant'

export const TypographyBlock = builder.prismaObject('Block', {
  variant: 'TypographyBlock',
  interfaces: [Block],
  isTypeOf: (obj: any) => obj.typename === 'TypographyBlock',
  directives: {
    key: { fields: 'id' }
  },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', {
      nullable: false,
      directives: { shareable: true }
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    content: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.content ?? ''
    }),
    variant: t.field({
      type: TypographyVariant,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.variant as TypographyVariantType
    }),
    color: t.field({
      type: TypographyColor,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.color as TypographyColorType
    }),
    align: t.field({
      type: TypographyAlign,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.align as TypographyAlignType
    })
  })
})
