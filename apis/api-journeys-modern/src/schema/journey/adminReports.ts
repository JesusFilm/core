import { GraphQLError } from 'graphql'

import { builder } from '../builder'

import { JourneysReportTypeEnum as JourneysReportType } from './enums'

// JourneysReportType enum moved to ./enums/journeysReportType.ts

// Simplified PowerBI service (without actual PowerBI SDK for now)
async function getPowerBiEmbed(reportType: string) {
  // In full implementation, this would:
  // 1. Use PowerBI SDK to authenticate
  // 2. Generate embed tokens
  // 3. Return proper PowerBI URLs and tokens

  // For now, return a mock response
  return {
    reportId: `report-${reportType}`,
    reportName: `Journey Analytics Report - ${reportType}`,
    embedUrl: `https://app.powerbi.com/reportEmbed?reportId=mock-${reportType}`,
    accessToken: 'mock-access-token',
    expiration: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  }
}

// Query: adminJourneysReport - returns JSON to avoid complex object types
builder.queryField('adminJourneysReport', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Json',
    nullable: true,
    args: {
      reportType: t.arg({ type: JourneysReportType, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { reportType } = args
      const user = context.user

      // Check if user has admin permissions
      // In full implementation, this would check for admin role or publisher permissions
      // For now, allow all authenticated users
      if (!user) {
        throw new GraphQLError('authentication required for admin reports', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      try {
        // Get PowerBI embed information
        return await getPowerBiEmbed(reportType)
      } catch (err: any) {
        // Log error but don't expose internal details
        console.error('PowerBI embed error:', err)
        throw new GraphQLError('failed to generate analytics report', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    }
  })
)
