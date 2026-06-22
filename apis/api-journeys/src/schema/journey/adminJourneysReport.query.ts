import { GraphQLError } from 'graphql'

import { getPowerBiEmbed } from '../../lib/powerBi/getPowerBiEmbed'
import { builder } from '../builder'

import { JourneysReportTypeEnum } from './enums/journeysReportType'
import { PowerBiEmbedRef } from './powerBiEmbed'

builder.queryField('adminJourneysReport', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: PowerBiEmbedRef,
    nullable: true,
    args: {
      reportType: t.arg({
        type: JourneysReportTypeEnum,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const userId = context.user.id

      let reportId: string | undefined
      switch (args.reportType) {
        case 'multipleFull':
          reportId = process.env.POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID
          break
        case 'multipleSummary':
          reportId = process.env.POWER_BI_JOURNEYS_MULTIPLE_SUMMARY_REPORT_ID
          break
        case 'singleFull':
          reportId = process.env.POWER_BI_JOURNEYS_SINGLE_FULL_REPORT_ID
          break
        case 'singleSummary':
          reportId = process.env.POWER_BI_JOURNEYS_SINGLE_SUMMARY_REPORT_ID
          break
      }

      if (
        process.env.POWER_BI_CLIENT_ID == null ||
        process.env.POWER_BI_CLIENT_SECRET == null ||
        process.env.POWER_BI_TENANT_ID == null ||
        process.env.POWER_BI_WORKSPACE_ID == null ||
        reportId == null
      ) {
        throw new GraphQLError('server environment variables missing', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }

      const config = {
        clientId: process.env.POWER_BI_CLIENT_ID,
        clientSecret: process.env.POWER_BI_CLIENT_SECRET,
        tenantId: process.env.POWER_BI_TENANT_ID,
        workspaceId: process.env.POWER_BI_WORKSPACE_ID
      }

      try {
        return await getPowerBiEmbed(config, reportId, userId)
      } catch (err) {
        if (err instanceof Error) {
          throw new GraphQLError(err.message, {
            extensions: { code: 'BAD_REQUEST' }
          })
        }
        throw new GraphQLError('An unexpected error occurred', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    }
  })
)
