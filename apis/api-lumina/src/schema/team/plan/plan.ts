import { builder } from '../../builder'

builder.prismaObject('TeamPlan', {
  name: 'LuminaTeamPlan',
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    stripeCustomerId: t.exposeString('stripeCustomerId'),
    stripeSubscriptionId: t.exposeString('stripeSubscriptionId', {
      nullable: true
    }),
    billingEmail: t.exposeString('billingEmail'),
    billingName: t.exposeString('billingName'),
    enabled: t.exposeBoolean('enabled'),
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
