import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { Block, IdType, ImageBlock, Journey, JourneyCreateInput, JourneyUpdateInput } from '../../graphql'
import { BlockMiddleware, IdAsKey, KeyAsId } from '../../lib/decorators'
import { BlockService } from '../block/block.service'
import { JourneyService } from './journey.service'
import slugify from 'slugify'
import { UseGuards } from '@nestjs/common'
import { AuthGuard } from '../auth/auth.guard'

@Resolver('Journey')
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService, private readonly blockService: BlockService) { }

  @Query()
  @KeyAsId()
  async journeys(): Promise<Journey[]> {    
    return await this.journeyservice.getAllPublishedJourneys()
  }

  @Query()
  @KeyAsId()
  async journey(@Args('id') _key: string, @Args('idType') idType: IdType = IdType.slug): Promise<Journey> {
    return idType === IdType.slug
      ? await this.journeyservice.getBySlug(_key)
      : await this.journeyservice.get(_key)
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  @IdAsKey()
  async createJourney(@Args('input') input: JourneyCreateInput): Promise<Journey> {
    if (input.slug != null) 
      input.slug = slugify(input.slug ?? input.title, { remove: /[*+~.()'"!:@#]/g })

    return await this.journeyservice.save(input)
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  @IdAsKey()
  async journeyUpdate(@Args('input') input: JourneyUpdateInput): Promise<Journey> {
    if (input.slug != null) 
      input.slug = slugify(input.slug, { remove: /[*+~.()'"!:@]#/g })
    
    return await this.journeyservice.update(input.id, input)
  }

  @Mutation()
  @UseGuards(new AuthGuard())
  async journeyPublish(@Args('id') id: string): Promise<Journey> {    
    return await this.journeyservice.update(id, { published: true })
  }


  @ResolveField('blocks')
  @KeyAsId()
  @BlockMiddleware()
  async blocks(@Parent() journey: Journey): Promise<Block[]> {
    return await this.blockService.forJourney(journey)
  }

  @ResolveField('ImageBlock')
  async primaryImageBlock(@Parent() journey: Journey): Promise<ImageBlock | null> {
    if (journey.primaryImageBlock?.id == null)
      return null
    return await this.blockService.get(journey.primaryImageBlock.id)
  }
}
