import { Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql/error'

@Injectable()
export class GrowthSpacesIntegrationService {
  async authenticate(accessId: string, accessSecret: string): Promise<void> {
    try {
      await fetch('https://api.growthspaces.org/api/v1/authentication', {
        headers: {
          'Access-Id': accessId,
          'Access-Secret': accessSecret
        }
      })
    } catch (e) {
      throw new GraphQLError(
        'incorrect access Id and access secret for Growth Space integration',
        {
          extensions: { code: 'UNAUTHORIZED' }
        }
      )
    }
  }
}
