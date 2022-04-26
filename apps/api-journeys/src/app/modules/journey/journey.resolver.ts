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
  UserJourneyRole,
  JourneysFilter
} from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { JourneyService } from './journey.service'

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
  ): Promise<Journey | null> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(id)
        : await this.journeyService.get(id)
    if (result == null) return null
    const ujResult = await this.userJourneyService.forJourneyUser(
      result.id,
      userId
    )
    if (ujResult == null)
      throw new ForbiddenError(
        'User has not received an invitation to edit this journey.'
      )
    if (ujResult.role === UserJourneyRole.inviteRequested)
      throw new ForbiddenError('User invitation pending.')

    return result
  }

  @Query()
  async journeys(@Args('where') where?: JourneysFilter): Promise<Journey[]> {
    return await this.journeyService.getAllPublishedJourneys(where)
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
    if (result?.publishedAt == null) return null
    return result
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
    @Parent() journey: Journey & { primaryImageBlockId?: string | null }
  ): Promise<ImageBlock | null> {
    if (journey.primaryImageBlockId == null) return null
    return await this.blockService.get(journey.primaryImageBlockId)
  }

  @ResolveField()
  async userJourneys(@Parent() journey: Journey): Promise<UserJourney[]> {
    return await this.userJourneyService.forJourney(journey)
  }

  @ResolveField()
  status(@Parent() { publishedAt }: Journey): JourneyStatus {
    return publishedAt == null ? JourneyStatus.draft : JourneyStatus.published
  }

  @ResolveField('language')
  async language(
    @Parent() journey
  ): Promise<{ __typename: 'Language'; id: string }> {
    // 529 (english) is default if not set
    return { __typename: 'Language', id: journey.languageId ?? '529' }
  }
}
