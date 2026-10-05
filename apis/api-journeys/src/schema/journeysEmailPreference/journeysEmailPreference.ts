import { builder } from '../builder'

// JourneysEmailPreference object type
export const JourneysEmailPreferenceRef = builder.prismaObject(
  'JourneysEmailPreference',
  {
    shareable: true,
    fields: (t) => ({
      email: t.exposeString('email', { nullable: false }),
      unsubscribeAll: t.exposeBoolean('unsubscribeAll', { nullable: false }),
      accountNotifications: t.exposeBoolean('accountNotifications', {
        nullable: false
      })
    })
  }
)
