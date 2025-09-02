import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

export const UserInviteRef = builder.prismaObject('UserInvite', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    journeyId: t.exposeID('journeyId', { nullable: false }),
    senderId: t.exposeID('senderId', { nullable: false }),
    email: t.exposeString('email', { nullable: false }),
    acceptedAt: t.expose('acceptedAt', { type: 'DateTime', nullable: true }),
    removedAt: t.expose('removedAt', { type: 'DateTime', nullable: true })
  })
})

// Register as a federated entity
builder.asEntity(UserInviteRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.userInvite.findUnique({ where: { id } })
})
