import { JourneyStatus, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

builder.queryField('journeyTemplateLanguageIds', (t) =>
  t.field({
    type: ['String'],
    nullable: false,
    override: { from: 'api-journeys' },
    resolve: async () => {
      const results = await prisma.journey.findMany({
        where: {
          template: true,
          status: JourneyStatus.published,
          teamId: 'jfp-team'
        },
        distinct: ['languageId'],
        select: { languageId: true }
      })
      return results.map((r) => r.languageId)
    }
  })
)
