import { builder } from '../../builder'
import { Block } from '../block'

import { IconColor, type IconColorType } from './enums/iconColor'
import { IconName, type IconNameType } from './enums/iconName'
import { IconSize, type IconSizeType } from './enums/iconSize'

export const IconBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'IconBlock',
  isTypeOf: (obj: any) => obj.typename === 'IconBlock',
  shareable: true,
  fields: (t) => ({
    name: t.field({
      type: IconName,
      nullable: true,
      resolve: (block) => block.name as IconNameType
    }),
    color: t.field({
      type: IconColor,
      nullable: true,
      resolve: (block) => block.color as IconColorType
    }),
    size: t.field({
      type: IconSize,
      nullable: true,
      resolve: (block) => block.size as IconSizeType
    })
  })
})
