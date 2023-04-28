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

  //   return aql.join(
  //     [
  //       template === true
  //         ? aql`AND journey.template == true`
  //         : aql`AND journey.template != true`,
  //       featured === true && aql`AND journey.featuredAt != null`,
  //       featured === false && aql`AND journey.featuredAt == null`
  //     ].filter((x) => x !== false)
  //   )
  // }

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
        userJourney: { some: { userId } },
        status: { in: [JourneyStatus.published, JourneyStatus.draft] }
      }
    })
    // const result = await this.db.query(aql`
    // FOR userJourney in userJourneys
    //   FOR journey in ${this.collection}
    //     FILTER CONTAINS(journey.title, ${title}) && userJourney.journeyId == journey._key && userJourney.userId == ${userId} && journey.status IN ${[
    //   JourneyStatus.published,
    //   JourneyStatus.draft
    // ]}
    //     RETURN journey
    // `)
    // return await result.all()
  }

  async getAllByIds(ids: string[]): Promise<Journey[]> {
    return await this.prismaService.journey.findMany({
      where: { id: { in: ids } }
    })
    // const result = await this.db.query(aql`
    //   FOR journey in ${this.collection}
    //       FILTER journey._key IN ${ids}
    //       RETURN journey
    // `)
    // return await result.all()
  }

  async getAllByRole(
    user: UserRole,
    status?: JourneyStatus[],
    template?: boolean
  ): Promise<Journey[]> {
    if (template === true && !includes(user.roles, Role.publisher)) return []

    // const statusFilter =
    //   status != null ? aql`&& journey.status IN ${status}` : aql`&& true`

    // const roleFilter =
    //   template === true
    //     ? aql`FOR journey in ${this.collection}
    //           FILTER journey.template == true`
    //     : aql`FOR userJourney in userJourneys
    //       FOR journey in ${this.collection}
    //         FILTER userJourney.journeyId == journey._key && userJourney.userId == ${user.userId}
    //           && (userJourney.role == ${UserJourneyRole.owner} || userJourney.role == ${UserJourneyRole.editor})`

    return await this.prismaService.journey.findMany({
      where: {
        status: { in: status },
        template: template === true ? true : undefined,
        userJourney:
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
    // const result = await this.db.query(aql`${roleFilter}
    //       ${statusFilter}
    //         RETURN journey
    //   `)
    // return await result.all()
  }
}
