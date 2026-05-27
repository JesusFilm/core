import { GraphQLError } from 'graphql'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'

import { queue as plausibleQueue } from '../../workers/plausible/queue'
import { builder } from '../builder'

import { JourneyCreateInput } from './inputs'
import { JourneyRef } from './journey'
import { Action, journeyAcl } from './journey.acl'

const ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED = 'P2002'

builder.mutationField('journeyCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        input: t.arg({ type: JourneyCreateInput, required: true }),
        teamId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { input, teamId } = args
        const userId = context.user.id

        let retry = true
        let slug = slugify(input.slug ?? input.title, {
          lower: true,
          strict: true
        })
        const id = input.id ?? uuidv4()

        while (retry) {
          try {
            const journey = await prisma.$transaction(async (tx) => {
              await tx.journey.create({
                data: {
                  id,
                  title: input.title,
                  languageId: input.languageId,
                  slug,
                  status: 'published',
                  publishedAt: new Date(),
                  themeMode: input.themeMode ?? undefined,
                  themeName: input.themeName ?? undefined,
                  description: input.description ?? undefined,
                  team: { connect: { id: String(teamId) } },
                  userJourneys: {
                    create: {
                      userId,
                      role: UserJourneyRole.owner
                    }
                  }
                }
              })
              const created = await tx.journey.findUnique({
                where: { id },
                include: {
                  userJourneys: true,
                  team: { include: { userTeams: true } }
                }
              })
              if (created == null)
                throw new GraphQLError('journey not found', {
                  extensions: { code: 'NOT_FOUND' }
                })
              if (!journeyAcl(Action.Create, created, context.user))
                throw new GraphQLError(
                  'user is not allowed to create journey',
                  { extensions: { code: 'FORBIDDEN' } }
                )
              return created
            })

            retry = false

            const FIVE_DAYS = 5 * 24 * 60 * 60
            void plausibleQueue.add(
              'create-journey-site',
              {
                __typename: 'plausibleCreateJourneySite',
                journeyId: journey.id
              },
              {
                removeOnComplete: true,
                removeOnFail: { age: FIVE_DAYS, count: 50 }
              }
            )
            void plausibleQueue.add(
              'create-team-site',
              {
                __typename: 'plausibleCreateTeamSite',
                teamId: String(teamId)
              },
              {
                removeOnComplete: true,
                removeOnFail: { age: FIVE_DAYS, count: 50 }
              }
            )

            return await prisma.journey.findUniqueOrThrow({
              ...query,
              where: { id: journey.id }
            })
          } catch (err: any) {
            if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
              slug = slugify(`${slug}-${id}`)
            } else {
              retry = false
              throw err
            }
          }
        }

        throw new GraphQLError('failed to create journey', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    })
)
