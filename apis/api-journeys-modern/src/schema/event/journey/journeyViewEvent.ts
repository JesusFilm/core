import { builder } from '../../builder'
import { Language } from '../../language'
import { EventInterface } from '../event'

// JourneyViewEvent type
export const JourneyViewEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'JourneyViewEvent',
  isTypeOf: (obj: any) => obj.typename === 'JourneyViewEvent',
  fields: (t) => ({
    language: t.field({
      type: Language,
      nullable: true,
      resolve: async (event) => {
        if (!event.languageId) return null
        return { id: event.languageId }
      }
    })
  })
})
