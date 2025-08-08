import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const EmailActionRef = builder.prismaObject('Action', {
  variant: 'EmailAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.email != null,
  fields: (t) => ({
    email: t.string({
      nullable: false,
      resolve: (action) => action.email || ''
    })
  })
})
