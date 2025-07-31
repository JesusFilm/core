import { builder } from '../../builder'
import { EventInterface } from '../event'

// JourneyViewEvent type
export const JourneyViewEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'JourneyViewEvent',
  isTypeOf: (obj: any) => obj.typename === 'JourneyViewEvent',
  fields: (t) => ({
    language: t.field({
      type: 'Json',
      nullable: true,
      resolve: async (event) => {
        if (!event.languageId) return null
        return { id: event.languageId }
      }
    })
  })
})
