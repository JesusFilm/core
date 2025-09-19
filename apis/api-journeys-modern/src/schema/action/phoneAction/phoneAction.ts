import { prisma } from '@core/prisma/journeys/client'

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

// Register as a federated entity
builder.asEntity(PhoneActionRef, {
  key: builder.selection<{ parentBlockId: string }>('parentBlockId'),
  resolveReference: async (ref) => {
    return prisma.action.findUnique({
      where: { parentBlockId: ref.parentBlockId }
    })
  }
})
