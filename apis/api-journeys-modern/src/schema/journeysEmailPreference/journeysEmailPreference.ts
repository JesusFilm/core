import { builder } from '../builder'

export const JourneysEmailPreferenceRef = builder.prismaObject(
  'JourneysEmailPreference',
  {
    fields: (t) => ({
      email: t.exposeString('email'),
      unsubscribeAll: t.exposeBoolean('unsubscribeAll'),
      accountNotifications: t.exposeBoolean('accountNotifications')
    })
  }
)
