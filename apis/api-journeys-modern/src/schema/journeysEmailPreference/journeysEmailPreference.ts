import { builder } from '../builder'

export const JourneysEmailPreferenceRef = builder.prismaObject(
  'JourneysEmailPreference',
  {
    shareable: true,
    fields: (t) => ({
      email: t.exposeString('email'),
      unsubscribeAll: t.exposeBoolean('unsubscribeAll'),
      accountNotifications: t.exposeBoolean('accountNotifications')
    })
  }
)
