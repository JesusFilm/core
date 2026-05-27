import { GraphQLError } from 'graphql'

import {
  JourneyStatus as PrismaJourneyStatus,
  Prisma,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { IdType } from './enums/idType'
import { JourneyRef } from './journey'
import { JourneysQueryOptions } from './inputs'

builder.queryField('journey', (t) =>
  t.prismaField({
    type: JourneyRef,
    nullable: true,
    override: { from: 'api-journeys' },
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

      if (options.embedded === true && options.hostname != null) {
        return null
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
