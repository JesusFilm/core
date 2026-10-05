import { builder } from '../../builder'
import { MessagePlatform as MessagePlatformEnum } from '../../enums'
import { EventInterface } from '../event'

export const ChatOpenEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'ChatOpenEvent',
  isTypeOf: (obj: any) => obj.typename === 'ChatOpenEvent',
  fields: (t) => ({
    messagePlatform: t.expose('messagePlatform', {
      type: MessagePlatformEnum,
      nullable: true
    })
  })
})
