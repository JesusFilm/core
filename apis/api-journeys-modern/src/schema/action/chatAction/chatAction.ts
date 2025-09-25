import { builder } from '../../builder'
import { MessagePlatform } from '../../enums'
import { ActionInterface } from '../action'

export const ChatActionRef = builder.prismaObject('Action', {
  variant: 'ChatAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.chatPlatform != null,
  fields: (t) => ({
    url: t.string({
      nullable: false,
      resolve: (action) => action.url || ''
    }),
    target: t.exposeString('target', { nullable: true }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    parentStepId: t.exposeString('parentStepId', { nullable: true }),
    chatPlatform: t.field({
      type: MessagePlatform,
      nullable: true,
      resolve: (action: any) => action.chatPlatform
    })
  })
})
