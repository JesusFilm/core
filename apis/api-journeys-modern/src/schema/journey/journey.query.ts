import { GraphQLError } from 'graphql'

import {
  Prisma,
  JourneyStatus as PrismaJourneyStatus,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { IdType } from './enums/idType'
import { JourneysQueryOptions } from './inputs'
import { JourneyRef } from './journey'

builder.queryField('journey', (t) =>
  t.prismaField({
    type: JourneyRef,
    // Non-null to preserve the legacy api-journeys contract (`journey: Journey!`).
    // Relaxing this to nullable breaks every consumer page typed against the
    // non-null result (apps/journeys, resources, journeys-admin templates) —
    // a break masked on main by stale nx codegen cache replay.
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      idType: t.arg({ type: IdType, required: false, defaultValue: 'slug' }),
      options: t.arg({ type: JourneysQueryOptions, required: false })
    },
    resolve: async (query, _parent, args) => {
      const options = args.options ?? {
        hostname: null,
        embedded: false,
        skipRoutingFilter: false
      }

      // embedded + hostname is an unsupported combination. The legacy resolver
      // returned null here under a non-null SDL (`Journey!`), which surfaced to
      // clients as a field error; throw NOT_FOUND to keep that error-shaped
      // behavior under the same non-null contract.
      if (options.embedded === true && options.hostname != null) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const filter: Prisma.JourneyWhereUniqueInput =
        args.idType === 'slug'
          ? { slug: String(args.id) }
          : { id: String(args.id) }

      if (options.embedded !== true) {
        if (options.hostname != null) {
          filter.team = {
            OR: [
              {
                customDomains: {
                  some: {
                    name: options.hostname,
                    routeAllTeamJourneys: true
                  }
                }
              },
              {
                journeyCollections: {
                  some: {
                    customDomains: { some: { name: options.hostname } }
                  }
                }
              }
            ]
          }
        } else if (options.skipRoutingFilter !== true) {
          filter.team = {
            customDomains: { none: { routeAllTeamJourneys: true } }
          }
        }
      }

      if (options.status != null && options.status.length > 0) {
        filter.status = {
          in: options.status as PrismaJourneyStatus[]
        }
      }

      const journey = await prisma.journey.findUnique({
        ...query,
        where: filter
      })
      if (journey == null)
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      return journey
    }
  })
)
