import { builder } from '../builder'

builder.prismaObject('Subscription', {
  name: 'LuminaSubscription',
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    stripeCustomerId: t.exposeString('stripeCustomerId'),
    stripeSubscriptionId: t.expose('stripeSubscriptionId', {
      type: 'String',
      nullable: true
    }),
    status: t.exposeString('status'),
    currentPeriodEnd: t.expose('currentPeriodEnd', {
      type: 'DateTime',
      nullable: true
    }),
    cancelAtPeriodEnd: t.exposeBoolean('cancelAtPeriodEnd'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team')
  })
})
