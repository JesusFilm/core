import {
  Args,
  Mutation,
  Query,
  Resolver
} from '@nestjs/graphql';

import { JourneyService } from './journey.service';
import { Journey, JourneyInput } from './journey.models';


@Resolver(of => Journey)
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService) {}

  @Query(returns => [Journey])
  async journeys() {
    return await this.journeyservice.getAll();
  }

  @Query(returns => Journey)
  async Journey(@Args('_key') _key: string) {
    return await this.journeyservice.getByKey(_key);
  }

  @Mutation(returns => Journey)
  async createJourney(@Args('journey') journey: JourneyInput) {
    const createdJourney = await this.journeyservice.insertOne(journey);
    return createdJourney;
  }
}