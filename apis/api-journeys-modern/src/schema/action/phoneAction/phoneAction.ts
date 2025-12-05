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
      resolve: (action) => action.phone ?? ''
    }),
    countryCode: t.string({
      nullable: false,
      resolve: (action) => action.countryCode ?? ''
    }),
    contactAction: t.field({
      type: ContactActionType,
      nullable: false,
      resolve: (action: any) => action.contactAction ?? 'call'
    }),
    customizable: t.exposeBoolean('customizable', { nullable: true }),
    parentStepId: t.exposeString('parentStepId', { nullable: true })
  })
})
