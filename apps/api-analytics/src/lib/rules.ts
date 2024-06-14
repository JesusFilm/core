import { preExecRule } from '@graphql-authz/core'

import { users as User } from '.prisma/api-analytics-client'

interface Context {
  currentUser?: User
}

export const IsAuthenticated = preExecRule({
  error: 'User is not authenticated'
})((context: Context) => context?.currentUser != null)

export const rules = {
  IsAuthenticated
} as const
