import { builder } from '../../builder'
import { MessagePlatform as MessagePlatformEnum } from '../../enums'
import { EventInterface } from '../event'

// ChatOpenEvent type
export const ChatOpenEventRef = builder.prismaObject('Event', {
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
