import { JourneyStatus, Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneysFilter, JourneysQueryOptions } from './inputs'
import { JourneyRef } from './journey'

builder.queryField('journeys', (t) =>
  t.prismaField({
    type: [JourneyRef],
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      where: t.arg({ type: JourneysFilter, required: false }),
      options: t.arg({ type: JourneysQueryOptions, required: false })
    },
    resolve: async (query, _parent, args) => {
      const where = args.where
      const options = args.options ?? {
        hostname: null,
        embedded: false,
        journeyCollection: false
      }

      if (options.embedded === true && options.hostname != null) return []

      const filter: Prisma.JourneyWhereInput = {
        status: JourneyStatus.published
      }
      if (where?.template != null) filter.template = where.template
      if (where?.featured != null)
        filter.featuredAt = where.featured ? { not: null } : null
      if (where?.ids != null) filter.id = { in: where.ids }

      const OR: Prisma.JourneyWhereInput[] = []
      if (where?.tagIds != null) {
        for (const tagId of where.tagIds) {
          OR.push({ journeyTags: { some: { tagId } } })
        }
      }

      if (options.embedded !== true) {
        if (options.hostname != null) {
          if (options.journeyCollection !== true) {
            OR.push({
              team: {
                customDomains: {
                  some: {
                    name: options.hostname,
                    routeAllTeamJourneys: true
                  }
                }
              }
            })
          }
          OR.push({
            journeyCollectionJourneys: {
              some: {
                journeyCollection: {
                  customDomains: { some: { name: options.hostname } }
                }
              }
            }
          })
        } else {
          filter.journeyCollectionJourneys = { none: {} }
          filter.team = {
            customDomains: { none: { routeAllTeamJourneys: true } }
          }
        }
      }

      if (where?.languageIds != null)
        filter.languageId = { in: where.languageIds }
      if (where?.fromTemplateId != null)
        filter.fromTemplateId = where.fromTemplateId
      if (where?.teamId != null) filter.teamId = where.teamId
      if (OR.length > 0) filter.OR = OR

      return await prisma.journey.findMany({
        ...query,
        where: filter,
        include:
          where?.tagIds != null
            ? { ...query.include, journeyTags: true }
            : query.include,
        take: where?.limit ?? undefined,
        orderBy:
          where?.orderByRecent === true ? { publishedAt: 'desc' } : undefined
      })
    }
  })
)
