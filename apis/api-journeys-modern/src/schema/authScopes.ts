import { GraphQLError } from 'graphql'

import { Role, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'
import { InteropContext } from '@core/yoga/interop'

interface BaseContext {
  type: string
}

interface PublicContext extends BaseContext {
  type: 'public'
}

export interface AuthenticatedContext extends BaseContext {
  type: 'authenticated'
  user: User
  currentRoles: Role[]
}

interface LocalInteropContext extends BaseContext, InteropContext {
  type: 'interop'
}

export type Context = LocalInteropContext | PublicContext | AuthenticatedContext

async function isIntegrationOwner({
  context,
  integrationId
}: {
  context: AuthenticatedContext
  integrationId: string
}): Promise<boolean> {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { userId: true }
  })
  if (integration == null) {
    throw new GraphQLError('Integration not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }
  return integration.userId === context.user.id
}

export async function isInTeam({
  context,
  teamId
}: {
  context: AuthenticatedContext
  teamId: string
}): Promise<boolean> {
  return (
    (await prisma.userTeam.findFirst({
      where: { teamId, userId: context.user.id }
    })) != null
  )
}

async function isTeamManager({
  context,
  teamId
}: {
  context: AuthenticatedContext
  teamId: string
}): Promise<boolean> {
  return (
    (
      await prisma.userTeam.findFirst({
        where: { teamId, userId: context.user.id },
        select: { role: true }
      })
    )?.role === 'manager'
  )
}

export interface AuthScopes {
  isAuthenticated: boolean
  isAnonymous: boolean
  isPublisher: boolean
  isValidInterop: boolean
}

export async function authScopes(context: Context) {
  const defaultScopes = {
    isAuthenticated: false,
    isAnonymous: false,
    isPublisher: false,
    isValidInterop: false
  }
  switch (context.type) {
    case 'authenticated':
      return {
        ...defaultScopes,
        isAuthenticated: true,
        isAnonymous: context.user.email == null,
        isPublisher: context.currentRoles.includes('publisher'),
        isInTeam: async (teamId: string) => await isInTeam({ context, teamId }),
        isIntegrationOwner: async (integrationId: string) =>
          await isIntegrationOwner({ context, integrationId }),
        isTeamManager: async (teamId: string) =>
          await isTeamManager({ context, teamId })
      }
    case 'interop':
      return {
        ...defaultScopes,
        isValidInterop: true
      }
    default:
      return defaultScopes
  }
}
