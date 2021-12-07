import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { Block, IdType, ImageBlock, Journey, JourneyCreateInput, JourneyStatus, JourneyUpdateInput } from '../../graphql'
import { BlockMiddleware, IdAsKey, KeyAsId, Omit } from '../../lib/decorators'
import { BlockService } from '../block/block.service'
import { JourneyService } from './journey.service'
import slugify from 'slugify'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../../lib/auth/auth.guard'

const omitFields = ['status']


function resolveStatus(journey: Journey): Journey {
  journey.status = journey.publishedAt == null
    ? JourneyStatus.draft
    : JourneyStatus.published
  return journey
}

@Resolver('Journey')
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService, private readonly blockService: BlockService) { }

  @Query()
  @KeyAsId()
  async journeys(@Args('status') status: JourneyStatus): Promise<Journey[]> {
    const result = status === JourneyStatus.published
      ? await this.journeyservice.getAllPublishedJourneys()
      : await this.journeyservice.getAllDraftJourneys()
    return result.map(resolveStatus)
  }

  @Query()
  @KeyAsId()
  async journey(@Args('id') _key: string, @Args('idType') idType: IdType = IdType.slug): Promise<Journey> {
    const result: Journey = idType === IdType.slug
      ? await this.journeyservice.getBySlug(_key)
      : await this.journeyservice.get(_key)
    return resolveStatus(result)
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  @IdAsKey()
  @Omit(omitFields)
  async createJourney(@Args('input') input: JourneyCreateInput): Promise<Journey> {
    if (input.slug != null) 
      input.slug = slugify(input.slug ?? input.title, { remove: /[*+~.()'"!:@#]/g })
    return await this.journeyservice.save(input)
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  @IdAsKey()
  @Omit(omitFields)
  async journeyUpdate(@Args('input') input: JourneyUpdateInput): Promise<Journey> {
    if (input.slug != null) 
      input.slug = slugify(input.slug, { remove: /[*+~.()'"!:@]#/g })
    return await this.journeyservice.update(input.id, input)
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async journeyPublish(@Args('id') id: string): Promise<Journey> {    
    return await this.journeyservice.update(id, { publishedAt: new Date() })
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
