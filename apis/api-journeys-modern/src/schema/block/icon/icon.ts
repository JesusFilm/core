import { builder } from '../../builder'
import { Block } from '../block'

import { IconColor, type IconColorType } from './enums/iconColor'
import { IconName, type IconNameType } from './enums/iconName'
import { IconSize, type IconSizeType } from './enums/iconSize'

interface IconBlockClassNamesType {
  self: string
}

const IconBlockClassNamesRef = builder.objectRef<IconBlockClassNamesType>(
  'IconBlockClassNames'
)

export const IconBlockClassNames = builder.objectType(IconBlockClassNamesRef, {
  fields: (t) => ({
    self: t.string({
      nullable: false,
      directives: { shareable: true },
      description: 'Tailwind class names for the icon block',
      resolve: (classNames: IconBlockClassNamesType) => classNames.self
    })
  })
})

export const IconBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'IconBlock',
  isTypeOf: (obj: any) => obj.typename === 'IconBlock',
  directives: { key: { fields: 'id' } },
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
    name: t.field({
      type: IconName,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.name as IconNameType
    }),
    color: t.field({
      type: IconColor,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.color as IconColorType
    }),
    size: t.field({
      type: IconSize,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.size as IconSizeType
    }),
    classNames: t.field({
      type: IconBlockClassNamesRef,
      nullable: false,
      directives: { shareable: true },
      resolve: ({ classNames }) =>
        classNames as unknown as IconBlockClassNamesType
    })
  })
})
