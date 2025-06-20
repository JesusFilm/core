import { builder } from '../../builder'
import { Block } from '../block'

interface SpacerBlockClassNamesType {
  self: string
}

const SpacerBlockClassNamesRef = builder.objectRef<SpacerBlockClassNamesType>(
  'SpacerBlockClassNames'
)

export const SpacerBlockClassNames = builder.objectType(
  SpacerBlockClassNamesRef,
  {
    fields: (t) => ({
      self: t.string({
        nullable: false,
        directives: { shareable: true },
        description: 'Tailwind class names for the spacer block',
        resolve: (classNames: SpacerBlockClassNamesType) => classNames.self
      })
    })
  }
)

export const SpacerBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'SpacerBlock',
  isTypeOf: (obj: any) => obj.typename === 'SpacerBlock',
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
    spacing: t.exposeInt('spacing', {
      nullable: true,
      directives: { shareable: true }
    }),
    classNames: t.field({
      type: SpacerBlockClassNamesRef,
      nullable: false,
      directives: { shareable: true },
      resolve: ({ classNames }) =>
        classNames as unknown as SpacerBlockClassNamesType
    })
  })
})
