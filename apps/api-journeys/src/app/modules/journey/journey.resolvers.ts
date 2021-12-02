import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { Block, IdType, Journey, JourneyCreateInput, JourneyUpdateInput } from '../../graphql'
import { BlockMiddleware, KeyAsId } from '../../lib/decorators'
import { BlockService } from '../block/block.service'
import { JourneyService } from './journey.service'

@Resolver('Journey')
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService, private readonly blockService: BlockService) { }

  @Query()
  @KeyAsId()
  async journeys(): Promise<Journey[]> {    
    return await this.journeyservice.getAll()
  }

  @Query()
  @KeyAsId()
  async journey(@Args('id') _key: string, @Args('idType') idType: IdType = IdType.slug): Promise<Journey> {
    return idType === IdType.slug
      ? await this.journeyservice.getBySlug(_key)
      : await this.journeyservice.get(_key)
  }

  @Mutation()
  async createJourney(@Args('journey') journey: JourneyCreateInput): Promise<Journey> {
    return await this.journeyservice.save(journey)
  }

  @Mutation()
  async journeyUpdate(@Args('journey') journey: JourneyUpdateInput): Promise<Journey> {
    return await this.journeyservice.update(journey.id, journey)
  }

  @ResolveField('blocks')
  @KeyAsId()
  @BlockMiddleware()
  async blocks(@Parent() journey: Journey): Promise<Block[]> {
    return await this.blockService.forJourney(journey.id)
  }

  // @ResolveField(of => ImageBlock, { nullable: true })
  // async primaryImageBlock(@Parent() journey: Journey) {
  //   return this.blockService.getByKey(journey.primaryImageBlockId)
  // }
}
