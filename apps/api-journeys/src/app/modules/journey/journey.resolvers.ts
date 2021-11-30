import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference
} from '@nestjs/graphql'
import { IdType, Journey, JourneyCreateInput } from '../../graphql'
import { KeyAsId } from '../../lib/decorators'
import { BlockService } from '../block/block.service'
import { JourneyService } from './journey.service'

@Resolver('Journey')
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService, private readonly blockService: BlockService) { }

  @Query()
  @KeyAsId()
  async journeys() {
    return await this.journeyservice.getAll()
  }

  @Query()
  @KeyAsId()
  async journey(@Args('id') _key: string, @Args('idType') idType: IdType = IdType.slug) {
    return idType === IdType.slug
      ? await this.journeyservice.getBySlug(_key)
      : await this.journeyservice.getByKey(_key)
  }

  @Mutation()
  async createJourney(@Args('journey') journey: JourneyCreateInput) {
    return await this.journeyservice.insertOne(journey)
  }

  @ResolveField('blocks')
  @KeyAsId()
  async blocks(@Parent() journey: Journey) {
    return this.blockService.forJourney(journey.id)
  }

  // @ResolveField(of => ImageBlock, { nullable: true })
  // async primaryImageBlock(@Parent() journey: Journey) {
  //   return this.blockService.getByKey(journey.primaryImageBlockId)
  // }
}
