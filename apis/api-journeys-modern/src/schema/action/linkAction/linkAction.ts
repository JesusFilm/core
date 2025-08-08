import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const LinkActionRef = builder.prismaObject('Action', {
  variant: 'LinkAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.url != null && action.email == null,
  fields: (t) => ({
    url: t.string({
      nullable: false,
      resolve: (action) => action.url || ''
    }),
    target: t.exposeString('target', { nullable: true }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    parentStepId: t.exposeString('parentStepId', { nullable: true })
  })
})
