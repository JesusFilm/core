import { builder } from '../../builder'
import { Block } from '../block'

interface RadioQuestionBlockClassNamesType {
  self: string
}

const RadioQuestionBlockClassNamesRef =
  builder.objectRef<RadioQuestionBlockClassNamesType>(
    'RadioQuestionBlockClassNames'
  )

export const RadioQuestionBlockClassNames = builder.objectType(
  RadioQuestionBlockClassNamesRef,
  {
    fields: (t) => ({
      self: t.string({
        nullable: false,
        directives: { shareable: true },
        description: 'Tailwind class names for the radio question block',
        resolve: (classNames: RadioQuestionBlockClassNamesType) =>
          classNames.self
      })
    })
  }
)

export const RadioQuestionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioQuestionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionBlock',
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
    classNames: t.field({
      type: RadioQuestionBlockClassNamesRef,
      nullable: false,
      directives: { shareable: true },
      resolve: ({ classNames }) =>
        classNames as unknown as RadioQuestionBlockClassNamesType
    })
  })
})
