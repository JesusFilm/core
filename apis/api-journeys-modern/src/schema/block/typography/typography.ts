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

interface TypographyBlockSettingsType {
  color: string | null
}

const TypographyBlockSettingsRef =
  builder.objectRef<TypographyBlockSettingsType>('TypographyBlockSettings')

const TypographyBlockSettings = builder.objectType(TypographyBlockSettingsRef, {
  shareable: true,
  fields: (t) => ({
    color: t.string({
      nullable: true,
      directives: { shareable: true },
      description: 'Color of the typography',
      resolve: (settings: TypographyBlockSettingsType) => settings.color
    })
  })
})

export const TypographyBlock = builder.prismaObject('Block', {
  variant: 'TypographyBlock',
  interfaces: [Block],
  isTypeOf: (obj: any) => obj.typename === 'TypographyBlock',
  shareable: true,
  fields: (t) => ({
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
    settings: t.field({
      type: TypographyBlockSettings,
      nullable: true,
      directives: { shareable: true },
      resolve: ({ settings }) =>
        settings as unknown as TypographyBlockSettingsType
    })
  })
})
