import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import slugify from 'slugify'

import { prisma } from '@core/prisma/journeys/client'

import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { queue as revalidateQueue } from '../../workers/revalidate/queue'
import { updateJourneyShortlink } from '../../workers/shortlinkUpdater/service'
import { builder } from '../builder'

import { JourneyUpdateInput } from './inputs'
import { JourneyRef } from './journey'
import { Action, journeyAcl } from './journey.acl'

const ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED = 'P2002'

builder.mutationField('journeyUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyRef,
      nullable: false,
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: JourneyUpdateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const journeyId = String(args.id)

        const journey = await prisma.journey.findUnique({
          where: { id: journeyId },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        })
        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        if (!journeyAcl(Action.Update, journey, context.user))
          throw new GraphQLError('user is not allowed to update journey', {
            extensions: { code: 'FORBIDDEN' }
          })

        const input = { ...args.input }
        if (input.slug != null)
          input.slug = slugify(input.slug, { lower: true, strict: true })

        if (input.hostId != null) {
          const host = await prisma.host.findUnique({
            where: { id: input.hostId }
          })
          if (host == null)
            throw new GraphQLError('host not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          if (host.teamId !== journey.teamId)
            throw new GraphQLError(
              'the team id of host does not match team id of journey',
              { extensions: { code: 'BAD_USER_INPUT' } }
            )
        }

        try {
          const result = await prisma.$transaction(async (tx) => {
            if (input.tagIds != null) {
              await tx.journeyTag.deleteMany({
                where: { journeyId: journey.id }
              })
            }

            const updated = await tx.journey.update({
              ...query,
              where: { id: journeyId },
              include: {
                ...query.include,
                team: { include: { customDomains: true } }
              },
              data: {
                ...(omit(input, ['tagIds']) as any),
                title: input.title ?? undefined,
                languageId: input.languageId ?? undefined,
                slug: input.slug ?? undefined,
                journeyTags:
                  input.tagIds != null
                    ? {
                        create: input.tagIds.map((tagId: string) => ({
                          tagId
                        }))
                      }
                    : undefined
              }
            })

            if (input.slug != null) {
              await updateJourneyShortlink(updated.id, input.slug)
            }

            return updated
          })

          if (
            input.seoTitle != null ||
            input.seoDescription != null ||
            input.primaryImageBlockId != null
          ) {
            void revalidateQueue
              .add('revalidate', {
                slug: result.slug,
                hostname: (result as any).team?.customDomains?.[0]?.name,
                fbReScrape: true
              })
              .catch(() => undefined)
          }

          if (input.website !== undefined) {
            await recalculateJourneyCustomizable(journeyId)
          }
          return result
        } catch (err: any) {
          if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED)
            throw new GraphQLError('slug is not unique', {
              extensions: { code: 'BAD_USER_INPUT' }
            })
          throw err
        }
      }
    })
)
