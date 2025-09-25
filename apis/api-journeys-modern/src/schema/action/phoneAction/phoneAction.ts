import { builder } from '../../builder'
import { ActionInterface } from '../action'

export const PhoneActionRef = builder.prismaObject('Action', {
  variant: 'PhoneAction',
  shareable: true,
  interfaces: [ActionInterface],
  isTypeOf: (action: any) => action.phone != null,
  fields: (t) => ({
    phone: t.string({
      nullable: false,
      resolve: ({ phone }) => phone ?? ''
    }),
    countryCode: t.string({
      nullable: false,
      resolve: ({ countryCode }) => countryCode ?? ''
    })
  })
})
