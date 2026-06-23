import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const ChatActionRef = builder.prismaObject('Action', {
  variant: 'ChatAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.chatUrl != null,
  fields: (t) => ({
    chatUrl: t.string({
      nullable: false,
      resolve: (action) => action.chatUrl || ''
    }),
    target: t.exposeString('target', { nullable: true }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    parentStepId: t.exposeString('parentStepId', { nullable: true })
  })
})
