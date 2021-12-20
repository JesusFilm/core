import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { Block, IdType, ImageBlock, Journey, JourneyCreateInput, JourneyStatus, JourneyUpdateInput } from '../../__generated__/graphql'
import { BlockMiddleware } from '../../lib/decorators'
import { IdAsKey, KeyAsId } from '@core/nest/decorators'
import { BlockService } from '../block/block.service'
import { JourneyService } from './journey.service'
import slugify from 'slugify'
import { UseGuards } from '@nestjs/common'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard'

function resolveStatus(journey: Journey): Journey {
  journey.status = journey.publishedAt == null
    ? JourneyStatus.draft
    : JourneyStatus.published
  return journey
}

@Resolver('Journey')
export class JourneyResolvers {
  constructor(private readonly journeyService: JourneyService, private readonly blockService: BlockService) { }

  @Query()
  @KeyAsId()
  async journeys(@Args('status') status: JourneyStatus): Promise<Journey[]> {
    const result = status === JourneyStatus.published
      ? await this.journeyService.getAllPublishedJourneys()
      : await this.journeyService.getAllDraftJourneys()
    return result.map(resolveStatus)
  }

  @Query()
  @KeyAsId()
  async journey(@Args('id') _key: string, @Args('idType') idType: IdType = IdType.slug): Promise<Journey> {
    const result: Journey = idType === IdType.slug
      ? await this.journeyService.getBySlug(_key)
      : await this.journeyService.get(_key)
    return resolveStatus(result)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  @IdAsKey()
  async createJourney(@Args('input') input: JourneyCreateInput): Promise<Journey> {
    if (input.slug != null) 
      input.slug = slugify(input.slug ?? input.title, { remove: /[*+~.()'"!:@#]/g })
    return await this.journeyService.save(input)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyUpdate(@Args('id') id: string, @Args('input') input: JourneyUpdateInput): Promise<Journey> {
    if (input.slug != null) 
      input.slug = slugify(input.slug, { remove: /[*+~.()'"!:@]#/g })
    return await this.journeyService.update(id, input)
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyPublish(@Args('id') id: string): Promise<Journey> {    
    return await this.journeyService.update(id, { publishedAt: new Date().toISOString() })
  }

  @ResolveField('blocks')
  @KeyAsId()
  @BlockMiddleware()
  async blocks(@Parent() journey: Journey): Promise<Block[]> {
    return await this.blockService.forJourney(journey)
  }

  @ResolveField('primaryImageBlock')
  @KeyAsId()
  @BlockMiddleware()
  async primaryImageBlock(@Parent() journey: Journey): Promise<ImageBlock | null> {
    if (journey.primaryImageBlock?.id == null)
      return null
    return await this.blockService.get(journey.primaryImageBlock.id)
  }
}
