import { ParseIntPipe, UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
  Context,
  Info,
  Root,
} from '@nestjs/graphql';
// import { PubSub } from 'graphql-subscriptions';
// import { GqlAuthGuard } from '../../guards/gql-auth.guard';
import { JourneyService } from './journey.service';
import { IJourney } from '../../interfaces/journey.interface';
import { root } from 'rxjs/internal/util/root';

// const pubSub = new PubSub();

@Resolver('user')
export class JourneyResolvers {
  constructor(private readonly journeyservice: JourneyService) {}

  @Query()
//   @UseGuards(GqlAuthGuard)
  async getJourneys(
    @Root() root: any,
    @Args() args: any,
    @Context() ctx: any,
    @Info() info: any,
  ) {
    return await this.journeyservice.getAll({});
  }

  @Query('user')
  async getByKey(
    @Root() root: any,
    @Args() args: any,
    @Context() ctx: any,
    @Info() info: any,
  ): Promise<any> {
    // console.log('userkey:' + _key);
    const _key = args('_key');
    return await this.journeyservice.getByKey(_key);
  }

  @Mutation('createJourney')
  async create(
    @Root() root: any,
    @Args() args: any,
    @Context() ctx: any,
    @Info() info: any,
  ): Promise<any> {
    const createdJourney = await this.journeyservice.insertOne(args.body);
    // pubSub.publish('userCreated', { userCreated: createdJourney });
    return createdJourney;
  }
  @Mutation('signin')
  async signin(
    @Root() root: any,
    @Args() args: any,
    @Context() ctx: any,
    @Info() info: any,
  ) {}
  @Mutation('signup')
  async signup(
    @Root() root: any,
    @Args() args: any,
    @Context() ctx: any,
    @Info() info: any,
  ) {}
//   @Subscription('userCreated')
//   userCreated() {
//     return {
//       subscribe: () => pubSub.asyncIterator('userCreated'),
//     };
//   }
}