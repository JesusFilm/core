import { builder } from '../../builder'

builder.prismaObject('TeamPlan', {
  name: 'LuminaTeamPlan',
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeID('teamId'),
    stripeCustomerId: t.exposeString('stripeCustomerId'),
    stripeSubscriptionId: t.exposeString('stripeSubscriptionId', {
      nullable: true
    }),
    billingEmail: t.exposeString('billingEmail'),
    billingName: t.exposeString('billingName'),
    billingAddressCity: t.exposeString('billingAddressCity', {
      nullable: true
    }),
    billingAddressCountry: t.exposeString('billingAddressCountry', {
      nullable: true
    }),
    billingAddressLine1: t.exposeString('billingAddressLine1', {
      nullable: true
    }),
    billingAddressLine2: t.exposeString('billingAddressLine2', {
      nullable: true
    }),
    billingAddressPostalCode: t.exposeString('billingAddressPostalCode', {
      nullable: true
    }),
    billingAddressState: t.exposeString('billingAddressState', {
      nullable: true
    }),
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
