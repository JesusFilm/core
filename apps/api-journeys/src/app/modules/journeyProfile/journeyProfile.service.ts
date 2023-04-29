import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Inject, Injectable } from '@nestjs/common'
import { JourneyProfile } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class JourneyProfileService {
  constructor(
    @Inject(PrismaService) private readonly prismaService: PrismaService
  ) {}

  @KeyAsId()
  async getJourneyProfileByUserId(
    userId: string
  ): Promise<JourneyProfile | null> {
    return this.prismaService.journeyProfile.findUnique({
      where: { userId }
    })
  }
}
