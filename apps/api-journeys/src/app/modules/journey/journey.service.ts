import { Injectable } from '@nestjs/common'
import { includes } from 'lodash'
import { Journey, UserRole } from '.prisma/api-journeys-client'
import {
  JourneyStatus,
  UserJourneyRole,
  JourneysFilter,
  Role
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

@Injectable()
export class JourneyService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllPublishedJourneys(filter?: JourneysFilter): Promise<Journey[]> {
    const { featured, template } = filter ?? {}
    return await this.prismaService.journey.findMany({
      where: {
        template: template === true ? true : undefined,
        featuredAt: featured === true ? { not: null } : undefined,
        status: JourneyStatus.published
      }
    })
  }

  async getBySlug(slug: string): Promise<Journey | null> {
    return await this.prismaService.journey.findFirst({
      where: {
        slug,
        status: {
          in: [
            JourneyStatus.published,
            JourneyStatus.draft,
            JourneyStatus.archived
          ]
        }
      }
    })
  }

  async getAllByTitle(title: string, userId: string): Promise<Journey[]> {
    return await this.prismaService.journey.findMany({
      where: {
        title: {
          contains: title
        },
        userJourneys: { some: { userId } },
        status: { in: [JourneyStatus.published, JourneyStatus.draft] }
      }
    })
  }

  async getAllByHost(hostId: string): Promise<Journey[]> {
    return await this.prismaService.journey.findMany({
      where: {
        hostId
      }
    })
  }

  async getAllByRole(
    user: UserRole,
    status?: JourneyStatus[],
    template?: boolean
  ): Promise<Journey[]> {
    if (template === true && !includes(user.roles, Role.publisher)) return []

    return await this.prismaService.journey.findMany({
      where: {
        status: { in: status },
        template: template === true ? true : undefined,
        userJourneys:
          template !== true
            ? {
                some: {
                  userId: user.userId,
                  role: {
                    in: [UserJourneyRole.owner, UserJourneyRole.editor]
                  }
                }
              }
            : undefined
      }
    })
  }
}
