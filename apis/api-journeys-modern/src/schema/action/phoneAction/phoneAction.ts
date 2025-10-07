import { builder } from '../../builder'
import { ActionInterface } from '../action'

import { ContactActionType } from './enums/contactActionType'

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
    }),
    contactAction: t.field({
      type: ContactActionType,
      nullable: false,
      resolve: (action: any) => action.contactAction ?? 'call'
    })
  })
})
