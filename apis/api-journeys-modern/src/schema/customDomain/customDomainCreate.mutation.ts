import { GraphQLError } from 'graphql'

import { Prisma, UserTeamRole, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CustomDomainRef } from './customDomain'
import { CustomDomainCreateInput } from './inputs'
import {
  createVercelDomain,
  deleteVercelDomain,
  isDomainValid,
  updateTeamShortLinks
} from './service'

const ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED = 'P2002'

builder.mutationField('customDomainCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: CustomDomainRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: CustomDomainCreateInput, required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const { input } = args

      if (!isDomainValid(input.name))
        throw new GraphQLError('custom domain has invalid domain name', {
          extensions: { code: 'BAD_USER_INPUT' }
        })

      try {
        return await prisma.$transaction(async (tx) => {
          const { apexName } = await createVercelDomain(input.name)

          const data: Prisma.CustomDomainCreateInput = {
            ...(input.id != null ? { id: input.id } : {}),
            name: input.name,
            apexName,
            team: { connect: { id: input.teamId } },
            routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined
          }

          if (input.journeyCollectionId != null) {
            data.journeyCollection = {
              connect: { id: input.journeyCollectionId }
            }
          }

          const customDomain = await tx.customDomain.create({
            ...query,
            data,
            include: {
              ...query.include,
              team: { include: { userTeams: true } }
            }
          })

          const hasTeamAccess = (customDomain as any).team?.userTeams?.some(
            (ut: { userId: string; role: UserTeamRole }) =>
              ut.userId === context.user.id && ut.role === UserTeamRole.manager
          )

          if (!hasTeamAccess) {
            await deleteVercelDomain(customDomain.name)
            throw new GraphQLError(
              'user is not allowed to create custom domain',
              {
                extensions: { code: 'FORBIDDEN' }
              }
            )
          }

          await updateTeamShortLinks(customDomain.teamId, customDomain.name)

          return customDomain
        })
      } catch (err: any) {
        if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
          throw new GraphQLError('custom domain already exists', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }
        throw err
      }
    }
  })
)
