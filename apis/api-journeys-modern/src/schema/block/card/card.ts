import {
  ThemeMode as PrismaThemeMode,
  ThemeName as PrismaThemeName
} from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { Block } from '../block'

import { ThemeMode } from './enums/themeMode'
import { ThemeName } from './enums/themeName'

export const CardBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'CardBlock',
  isTypeOf: (obj: any) => obj.typename === 'CardBlock',
  shareable: true,
  fields: (t) => ({
    backgroundColor: t.exposeString('backgroundColor', {
      nullable: true,
      description: `backgroundColor should be a HEX color value e.g #FFFFFF for white.`
    }),
    backdropBlur: t.exposeInt('backdropBlur', {
      nullable: true,
      description: `backdropBlur should be a number representing blur amount in pixels e.g 20.`
    }),
    coverBlockId: t.exposeID('coverBlockId', {
      nullable: true,
      description: `coverBlockId is present if a child block should be used as a cover.
This child block should not be rendered normally, instead it should be used
as a background. Blocks are often of type ImageBlock or VideoBlock.`
    }),
    fullscreen: t.boolean({
      nullable: false,
      description: `fullscreen should control how the coverBlock is displayed. When fullscreen
is set to true the coverBlock Image should be displayed as a blur in the
background.`,
      resolve: (block) => block.fullscreen ?? false
    }),
    themeMode: t.field({
      type: ThemeMode,
      nullable: true,
      description: `themeMode can override journey themeMode. If nothing is set then use
themeMode from journey`,
      resolve: (block) => block.themeMode as PrismaThemeMode | null
    }),
    themeName: t.field({
      type: ThemeName,
      nullable: true,
      description: `themeName can override journey themeName. If nothing is set then use
themeName from journey`,
      resolve: (block) => block.themeName as PrismaThemeName | null
    })
  })
})
