import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators'
import slugify from 'slugify'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { get } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

import { BlockService } from '../block/block.service'
import {
  Block,
  IdType,
  ImageBlock,
  Journey,
  JourneyCreateInput,
  JourneyStatus,
  JourneyUpdateInput,
  ThemeMode,
  ThemeName,
  UserJourney,
  UserJourneyRole
} from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { JourneyService } from './journey.service'

function resolveStatus(journey: Journey): Journey {
  journey.status =
    journey.publishedAt == null ? JourneyStatus.draft : JourneyStatus.published
  return journey
}

const ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED = 1210

@Resolver('Journey')
export class JourneyResolver {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly blockService: BlockService,
    private readonly userJourneyService: UserJourneyService
  ) {}

  @Query()
  async adminJourneys(@CurrentUserId() userId: string): Promise<Journey[]> {
    return await this.journeyService.getAllByOwnerEditor(userId)
  }

  @Query()
  async adminJourney(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(id)
        : await this.journeyService.get(id)
    const resolved = resolveStatus(result)
    const ujResult = await this.userJourneyService.forJourneyUser(
      get(resolved, 'id'),
      userId
    )
    if (ujResult == null)
      throw new ForbiddenError(
        'User has not received an invitation to edit this journey.'
      )
    if (ujResult.role === UserJourneyRole.inviteRequested)
      throw new ForbiddenError('User invitation pending.')

    return resolved
  }

  @Query()
  async journeys(): Promise<Journey[]> {
    return await this.journeyService.getAllPublishedJourneys()
  }

  @Query()
  async journey(
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey | null> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(id)
        : await this.journeyService.get(id)
    const resolved = resolveStatus(result)
    return resolved.status === JourneyStatus.published ? resolved : null
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyCreate(
    @Args('input') input: JourneyCreateInput & { id?: string },
    @CurrentUserId() userId: string
  ): Promise<Journey | undefined> {
    input.id = input.id ?? uuidv4()
    input.slug = slugify(input.slug ?? input.title, {
      lower: true,
      strict: true
    })
    let retry = true
    while (retry) {
      try {
        const journey: Journey = await this.journeyService.save({
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          createdAt: new Date().toISOString(),
          locale: 'en-US',
          status: JourneyStatus.draft,
          ...input
        })
        await this.userJourneyService.save({
          userId,
          journeyId: journey.id,
          role: UserJourneyRole.owner
        })
        retry = false
        return journey
      } catch (err) {
        if (err.errorNum === ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED) {
          input.slug = slugify(`${input.slug}-${input.id}`)
        } else {
          retry = false
          throw err
        }
      }
    }
  }

  @Mutation()
  @UseGuards(RoleGuard('id', [UserJourneyRole.owner, UserJourneyRole.editor]))
  async journeyUpdate(
    @Args('id') id: string,
    @Args('input') input: JourneyUpdateInput
  ): Promise<Journey> {
    if (input.slug != null)
      input.slug = slugify(input.slug, {
        lower: true,
        strict: true
      })
    try {
      return await this.journeyService.update(id, input)
    } catch (err) {
      if (err.errorNum === ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED) {
        throw new UserInputError('Slug is not unique')
      } else {
        throw err
      }
    }
  }

  @Mutation()
  @UseGuards(RoleGuard('id', UserJourneyRole.owner))
  async journeyPublish(@Args('id') id: string): Promise<Journey> {
    return await this.journeyService.update(id, {
      status: JourneyStatus.published,
      publishedAt: new Date().toISOString()
    })
  }

  @ResolveField()
  async blocks(@Parent() journey: Journey): Promise<Block[]> {
    return await this.blockService.forJourney(journey)
  }

  @ResolveField()
  async primaryImageBlock(
    @Parent() journey: Journey
  ): Promise<ImageBlock | null> {
    if (journey.primaryImageBlock?.id == null) return null
    return await this.blockService.get(journey.primaryImageBlock.id)
  }

  @ResolveField()
  async userJourneys(@Parent() journey: Journey): Promise<UserJourney[]> {
    return await this.userJourneyService.forJourney(journey)
  }
}
