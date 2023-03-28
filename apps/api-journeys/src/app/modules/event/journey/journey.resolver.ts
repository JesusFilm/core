// Block resolver tests are in individual block type spec files

import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { CurrentUserAgent } from '@core/nest/decorators/CurrentUserAgent'
import { UserInputError } from 'apollo-server-errors'
import {
  JourneyViewEvent,
  JourneyViewEventCreateInput
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'
import { JourneyService } from '../../journey/journey.service'

@Resolver('JourneyViewEvent')
export class JourneyViewEventResolver {
  constructor(
    private readonly eventService: EventService,
    private readonly visitorService: VisitorService,
    private readonly journeyService: JourneyService
  ) {}

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyViewEventCreate(
    @CurrentUserId() userId: string,
    @CurrentUserAgent() userAgent: string,
    @Args('input') input: JourneyViewEventCreateInput
  ): Promise<JourneyViewEvent> {
    const journey = await this.journeyService.get(input.journeyId)
    if (journey == null) {
      throw new UserInputError('Journey does not exist')
    }
    const visitor = await this.visitorService.getByUserIdAndJourneyId(
      userId,
      input.journeyId
    )

    const promiseArray = [
      this.eventService.save({
        ...input,
        __typename: 'JourneyViewEvent',
        visitorId: visitor.id,
        createdAt: new Date().toISOString()
      }),
      this.visitorService.getByUserIdAndJourneyId(userId, input.journeyId)
    ]

    if (visitor.userAgent == null) {
      promiseArray.push(
        this.visitorService.update(visitor.id, {
          userAgent
        })
      )
    }

    const [JourneyViewEvent] = await Promise.all([...promiseArray])
    return JourneyViewEvent
  }

  @ResolveField('language')
  language(@Parent() journeyViewEvent): { __typename: 'Language'; id: string } {
    // 529 (english) is default if not set
    return { __typename: 'Language', id: journeyViewEvent.value ?? '529' }
  }
}
