import { builder } from '../../builder'
import { Block } from '../block'

import { ThemeMode, type ThemeModeType } from './enums/themeMode'
import { ThemeName, type ThemeNameType } from './enums/themeName'

interface CardBlockClassNamesType {
  self: string
}

const CardBlockClassNamesRef = builder.objectRef<CardBlockClassNamesType>(
  'CardBlockClassNames'
)

export const CardBlockClassNames = builder.objectType(CardBlockClassNamesRef, {
  fields: (t) => ({
    self: t.string({
      nullable: false,
      directives: { shareable: true },
      description: 'Tailwind class names for the card block',
      resolve: (classNames: CardBlockClassNamesType) => classNames.self
    })
  })
})

export const CardBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'CardBlock',
  isTypeOf: (obj: any) => obj.typename === 'CardBlock',
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
    backgroundColor: t.exposeString('backgroundColor', {
      nullable: true,
      directives: { shareable: true },
      description: `backgroundColor should be a HEX color value e.g #FFFFFF for white.`
    }),
    backdropBlur: t.exposeInt('backdropBlur', {
      nullable: true,
      directives: { shareable: true },
      description: `backdropBlur should be a number representing blur amount in pixels e.g 20.`
    }),
    coverBlockId: t.exposeID('coverBlockId', {
      nullable: true,
      directives: { shareable: true },
      description: `coverBlockId is present if a child block should be used as a cover.
This child block should not be rendered normally, instead it should be used
as a background. Blocks are often of type ImageBlock or VideoBlock.`
    }),
    fullscreen: t.boolean({
      nullable: false,
      directives: { shareable: true },
      description: `fullscreen should control how the coverBlock is displayed. When fullscreen
is set to true the coverBlock Image should be displayed as a blur in the
background.`,
      resolve: (block) => block.fullscreen ?? false
    }),
    themeMode: t.field({
      type: ThemeMode,
      nullable: true,
      directives: { shareable: true },
      description: `themeMode can override journey themeMode. If nothing is set then use
themeMode from journey`,
      resolve: (block) => block.themeMode as ThemeModeType
    }),
    themeName: t.field({
      type: ThemeName,
      nullable: true,
      directives: { shareable: true },
      description: `themeName can override journey themeName. If nothing is set then use
themeName from journey`,
      resolve: (block) => block.themeName as ThemeNameType
    }),
    classNames: t.field({
      type: CardBlockClassNamesRef,
      nullable: false,
      directives: { shareable: true },
      resolve: ({ classNames }) =>
        classNames as unknown as CardBlockClassNamesType
    })
  }),
  directives: { key: { fields: 'id' } }
})
