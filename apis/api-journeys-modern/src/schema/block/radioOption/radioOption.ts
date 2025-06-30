import { builder } from '../../builder'
import { Block } from '../block'

interface RadioOptionBlockClassNamesType {
  self: string
}

const RadioOptionBlockClassNamesRef =
  builder.objectRef<RadioOptionBlockClassNamesType>(
    'RadioOptionBlockClassNames'
  )

export const RadioOptionBlockClassNames = builder.objectType(
  RadioOptionBlockClassNamesRef,
  {
    fields: (t) => ({
      self: t.string({
        nullable: false,
        directives: { shareable: true },
        description: 'Tailwind class names for the radio option block',
        resolve: (classNames: RadioOptionBlockClassNamesType) => classNames.self
      })
    })
  }
)

export const RadioOptionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioOptionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioOptionBlock',
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
    label: t.string({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.label ?? ''
    }),
    classNames: t.field({
      type: RadioOptionBlockClassNamesRef,
      nullable: false,
      directives: { shareable: true },
      resolve: ({ classNames }) =>
        classNames as unknown as RadioOptionBlockClassNamesType
    })
  })
})
