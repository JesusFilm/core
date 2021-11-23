import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference
} from '@nestjs/graphql'

import { JourneyService } from './journey.service'
import { Journey, JourneyInput } from './journey.models'
import { Block } from '../block/block.models'
import { BlockService } from '../block/block.service'

@Resolver(of => Journey)
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService, private readonly blockService: BlockService) {}

  @Query(returns => [Journey])
  async journeys() {
    return await this.journeyservice.getAll()
  }

  @Query(returns => Journey)
  async journey(@Args('id', { type: () => ID }) _key: string, @Args('idType') idType: string = '') {
    return idType === 'slug' 
      ? await this.journeyservice.getBySlug(_key)
      : await this.journeyservice.getByKey(_key)
  }

  @Mutation(returns => Journey)
  async createJourney(@Args('journey') journey: JourneyInput) {
    return await this.journeyservice.insertOne(journey)
  }
  @ResolveField(of => [Block])
  async blocks(@Parent() journey: Journey) {
    return this.blockService.forJourney(journey._key);
  }

  @ResolveReference()
  async resolveReference(reference: { __typename: string; id: string }) {
    return await this.journeyservice.getByKey(reference.id)
  }
}
