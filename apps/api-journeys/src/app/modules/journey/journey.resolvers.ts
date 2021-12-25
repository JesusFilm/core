import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
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
import { CurrentUserId, IdAsKey, KeyAsId } from '@core/nest/decorators'
import { BlockService } from '../block/block.service'
import { JourneyService } from './journey.service'
import slugify from 'slugify'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'

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
  async journeys(@Args('status') status: JourneyStatus): Promise<Journey[]> {
    switch (status) {
      case JourneyStatus.published:
        return await this.journeyService.getAllPublishedJourneys()
      case JourneyStatus.draft:
        return await this.journeyService.getAllDraftJourneys()
      default:
        return await this.journeyService.getAll()
    }
  }

  @Query()
  @KeyAsId()
  async journey(
    @Args('id') _key: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(_key)
        : await this.journeyService.get(_key)
    return resolveStatus(result)
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
      status: JourneyStatus.draft,
      published: false
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
      published: true,
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
