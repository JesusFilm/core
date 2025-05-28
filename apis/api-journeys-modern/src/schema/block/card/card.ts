import { builder } from '../../builder'
import { Block } from '../block'

import { ThemeMode, type ThemeModeType } from './enums/themeMode'
import { ThemeName, type ThemeNameType } from './enums/themeName'

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
      directives: { shareable: true }
    }),
    coverBlockId: t.exposeID('coverBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    fullscreen: t.exposeBoolean('fullscreen', {
      nullable: true,
      directives: { shareable: true }
    }),
    themeMode: t.field({
      type: ThemeMode,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.themeMode as ThemeModeType
    }),
    themeName: t.field({
      type: ThemeName,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.themeName as ThemeNameType
    })
  }),
  directives: { key: { fields: 'id' } }
})
