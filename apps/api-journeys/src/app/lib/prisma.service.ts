import { Injectable, OnModuleInit } from '@nestjs/common'

import { PrismaClient } from '.prisma/api-journeys-client'

export const ACTION_AND_JOURNEY = {
  action: true,
  journey: {
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect()
  }
}
