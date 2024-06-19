import { preExecRule } from '@graphql-authz/core'

import type { Context } from '../schema/builder'

export const IsAuthenticated = preExecRule({
  error: 'User is not authenticated'
})((context: Context) => context.currentUser != null)

export const rules = {
  IsAuthenticated
} as const
