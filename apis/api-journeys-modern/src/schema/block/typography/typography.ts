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

interface TypographyBlockClassNamesType {
  self: string
}

const TypographyBlockClassNamesRef =
  builder.objectRef<TypographyBlockClassNamesType>('TypographyBlockClassNames')

export const TypographyBlockClassNames = builder.objectType(
  TypographyBlockClassNamesRef,
  {
    fields: (t) => ({
      self: t.string({
        nullable: false,
        directives: { shareable: true },
        description: 'Tailwind class names for the typography block',
        resolve: (classNames: TypographyBlockClassNamesType) => classNames.self
      })
    })
  }
)

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
    }),
    classNames: t.field({
      type: TypographyBlockClassNamesRef,
      nullable: false,
      directives: { shareable: true },
      resolve: ({ classNames }) =>
        classNames as unknown as TypographyBlockClassNamesType
    })
  })
})
