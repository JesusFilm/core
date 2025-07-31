import { builder } from '../../builder'
import { EventInterface } from '../event'

import { ButtonActionEnum } from './enums'

// Define ButtonAction enum

// ButtonClickEvent type
export const ButtonClickEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'ButtonClickEvent',
  isTypeOf: (obj: any) => obj.typename === 'ButtonClickEvent',
  fields: (t) => ({
    action: t.expose('action', { type: ButtonActionEnum, nullable: true }),
    actionValue: t.exposeString('actionValue', { nullable: true })
  })
})
