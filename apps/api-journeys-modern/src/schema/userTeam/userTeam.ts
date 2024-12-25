import { builder } from '../builder'
import { User } from '../user/user'

const UserTeam = builder.prismaObject('UserTeam', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.field({
      nullable: false,
      type: User,
      resolve: ({ userId }) => ({ id: userId })
    }),
    role: t.expose('UserTeamRole', { nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      nullable: false,
      resolve: ({ createdAt }) => createdAt
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      nullable: false,
      resolve: ({ updatedAt }) => updatedAt
    })
  })
})
