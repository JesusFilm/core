import {
  Args,
  Mutation,
  Query,
  Resolver
} from '@nestjs/graphql';

import { JourneyService } from './journey.service';
import { JourneyType, JourneyInput } from './journey.models';


@Resolver(of => JourneyType)
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService) {}

  @Query(returns => [JourneyType])
  async getJourneys() {
    return await this.journeyservice.getAll({});
  }

  @Query(returns => JourneyType)
  async getByKey(@Args('_key', {type: () => String }) _key: string) {
    return await this.journeyservice.getByKey(_key);
  }

  @Mutation(returns => JourneyType)
  async create(@Args('journey') journey: JourneyInput) {
    const createdJourney = await this.journeyservice.insertOne(journey);
    return createdJourney;
  }
}