import { builder } from '../builder'
import { User } from '../user/user'

import { UserTeamRole } from './enums/userTeamRole'

builder.prismaObject('UserTeam', {
  fields: (t) => ({
    id: t.exposeID('id'),
    user: t.field({
      type: User,
      resolve: ({ userId: id }) => ({ id })
    }),
    role: t.expose('role', { type: UserTeamRole }),
    createAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' })
  })
})
