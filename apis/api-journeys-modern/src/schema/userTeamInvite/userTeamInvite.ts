import { builder } from '../builder'

export const UserTeamInviteRef = builder.prismaObject('UserTeamInvite', {
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeID('teamId'),
    email: t.exposeString('email'),
    senderId: t.exposeID('senderId'),
    receipientId: t.exposeID('receipientId', { nullable: true }),
    acceptedAt: t.expose('acceptedAt', { type: 'DateTime', nullable: true }),
    removedAt: t.expose('removedAt', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    team: t.relation('team')
  })
})
