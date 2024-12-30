import { builder } from '../builder'
import { User } from '../user/user'

import { UserTeamRole } from './enums/userTeamRole'

const UserTeam = builder.prismaObject('UserTeam', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.field({
      nullable: false,
      type: User,
      resolve: ({ userId }) => ({ id: userId })
    }),
    role: t.expose('role', { type: UserTeamRole, nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      nullable: false
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      nullable: false
    })
  })
})
