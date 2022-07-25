import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { v4 as uuidv4 } from 'uuid'
import {
  TemplateLibraryViewEvent,
  TemplateUseEventInput,
  TemplateUseEvent,
  TemplatePreviewEventInput,
  TemplatePreviewEvent
} from '../../../__generated__/graphql'
import { EventService } from '../event.service'

@Resolver('TemplateLibraryViewEvent')
@UseGuards(GqlAuthGuard)
export class TemplateLibraryViewEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  async templateLibraryViewEventCreate(
    @CurrentUserId() userId: string
  ): Promise<TemplateLibraryViewEvent> {
    return await this.eventService.save({
      __typename: 'TemplateLibraryViewEvent',
      userId,
      id: uuidv4()
    })
  }
}

@Resolver('TemplateLibraryViewEvent')
@UseGuards(GqlAuthGuard)
export class TemplateUseEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  async templateUseEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TemplateUseEventInput
  ): Promise<TemplateUseEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'TemplateUseEvent',
      userId,
      id: uuidv4()
    })
  }
}

@Resolver('TemplateLibraryViewEvent')
@UseGuards(GqlAuthGuard)
export class TemplatePreviewEventResolver {
  constructor(private readonly eventService: EventService) {}
  @Mutation()
  async templatePreivewEventCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: TemplatePreviewEventInput
  ): Promise<TemplatePreviewEvent> {
    return await this.eventService.save({
      ...input,
      __typename: 'TemplatePreviewEvent',
      userId,
      id: uuidv4()
    })
  }
}
