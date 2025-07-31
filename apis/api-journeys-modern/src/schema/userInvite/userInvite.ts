import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

export const UserInviteRef = builder.prismaObject('UserInvite', {
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeID('journeyId'),
    senderId: t.exposeID('senderId'),
    email: t.exposeString('email'),
    acceptedAt: t.expose('acceptedAt', { type: 'DateTime', nullable: true }),
    removedAt: t.expose('removedAt', { type: 'DateTime', nullable: true }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    journey: t.relation('journey')
  })
})

// Register as a federated entity
builder.asEntity(UserInviteRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.userInvite.findUnique({ where: { id } })
})
