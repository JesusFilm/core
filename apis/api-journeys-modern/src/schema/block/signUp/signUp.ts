import { builder } from '../../builder'
import { Block } from '../block'

interface SignUpBlockClassNamesType {
  self: string
}

const SignUpBlockClassNamesRef = builder.objectRef<SignUpBlockClassNamesType>(
  'SignUpBlockClassNames'
)

export const SignUpBlockClassNames = builder.objectType(
  SignUpBlockClassNamesRef,
  {
    fields: (t) => ({
      self: t.string({
        nullable: false,
        directives: { shareable: true },
        description: 'Tailwind class names for the sign up block',
        resolve: (classNames: SignUpBlockClassNamesType) => classNames.self
      })
    })
  }
)

builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'SignUpBlock',
  isTypeOf: (obj: any) => obj.typename === 'SignUpBlock',
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
    submitIconId: t.exposeID('submitIconId', {
      nullable: true,
      directives: { shareable: true }
    }),
    submitLabel: t.exposeString('submitLabel', {
      nullable: true,
      directives: { shareable: true }
    }),
    classNames: t.field({
      type: SignUpBlockClassNamesRef,
      nullable: false,
      directives: { shareable: true },
      resolve: ({ classNames }) =>
        classNames as unknown as SignUpBlockClassNamesType
    })
  })
})
