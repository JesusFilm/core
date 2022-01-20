import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { CurrentUserId, IdAsKey, KeyAsId } from '@core/nest/decorators'
import slugify from 'slugify'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { ForbiddenError } from 'apollo-server-errors'
import { get } from 'lodash'
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

@Resolver('Journey')
export class JourneyResolvers {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly blockService: BlockService,
    private readonly userJourneyService: UserJourneyService
  ) {}

  @Query()
  @KeyAsId()
  async adminJourneys(@CurrentUserId() userId: string): Promise<Journey[]> {
    return await this.journeyService.getAllByOwnerEditor(userId)
  }

  @Query()
  @KeyAsId()
  async adminJourney(
    @CurrentUserId() userId: string,
    @Args('id') _key: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(_key)
        : await this.journeyService.get(_key)
    const resolved = resolveStatus(result)
    const ujResult = await this.userJourneyService.forJourneyUser(
      get(resolved, '_key'),
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
  @KeyAsId()
  async journeys(): Promise<Journey[]> {
    return await this.journeyService.getAllPublishedJourneys()
  }

  @Query()
  @KeyAsId()
  async journey(
    @Args('id') _key: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey | null> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(_key)
        : await this.journeyService.get(_key)
    const resolved = resolveStatus(result)
    return resolved.status === JourneyStatus.published ? resolved : null
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async journeyCreate(
    @Args('input') input: JourneyCreateInput,
    @CurrentUserId() userId: string
  ): Promise<Journey> {
    if (input.slug != null)
      input.slug = slugify(input.slug ?? input.title, {
        remove: /[*+~.()'"!:@#]/g
      })
    const journey: Journey & { _key: string } = await this.journeyService.save({
      ...input,
      createdAt: new Date().toISOString(),
      themeName: input.themeName ?? ThemeName.base,
      themeMode: input.themeMode ?? ThemeMode.light,
      locale: input.locale ?? 'en-US',
      status: JourneyStatus.draft
    })
    await this.userJourneyService.save({
      userId,
      journeyId: journey._key,
      role: UserJourneyRole.owner
    })
    return journey
  }

  @Mutation()
  @UseGuards(RoleGuard('id', [UserJourneyRole.owner, UserJourneyRole.editor]))
  async journeyUpdate(
    @Args('id') id: string,
    @Args('input') input: JourneyUpdateInput
  ): Promise<Journey> {
    if (input.slug != null)
      input.slug = slugify(input.slug, { remove: /[*+~.()'"!:@]#/g })
    return await this.journeyService.update(id, input)
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
  @KeyAsId()
  async blocks(@Parent() journey: Journey): Promise<Block[]> {
    return await this.blockService.forJourney(journey)
  }

  @ResolveField()
  @KeyAsId()
  async primaryImageBlock(
    @Parent() journey: Journey
  ): Promise<ImageBlock | null> {
    if (journey.primaryImageBlock?.id == null) return null
    return await this.blockService.get(journey.primaryImageBlock.id)
  }

  @ResolveField()
  @KeyAsId()
  async userJourneys(@Parent() journey: Journey): Promise<UserJourney[]> {
    return await this.userJourneyService.forJourney(journey)
  }
}
