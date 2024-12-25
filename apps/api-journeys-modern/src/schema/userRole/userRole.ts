import { builder } from '../builder'

import { Role } from './enums/role'

export const UserRole = builder.prismaObject('UserRole', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    roles: t.field({
      type: [Role],
      resolve: ({ roles }) => roles
    })
  })
})
