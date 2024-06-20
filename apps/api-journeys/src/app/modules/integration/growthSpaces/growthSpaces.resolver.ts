import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import {
  GrowthSpaceIntegrationCreateInput,
  GrowthSpaceIntegrationUpdateInput
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('GrowthSpacesIntegration')
export class GrowthSpacesIntegration {
  constructor(private readonly prismaService: PrismaService) {}
  @Query()
  async getGrowthSpacesRoutes(@Args('growthSpaceId') growthSpaceId: string) {}

  @Mutation()
  async growthSpacesIntegrationCreate(
    @Args('teamId') teamId: string,
    @Args('input') input: GrowthSpaceIntegrationCreateInput
  ) {}

  @Mutation()
  async growthSpacesIntegrationUpdate(
    @Args('teamId') teamId: string,
    @Args('input') input: GrowthSpaceIntegrationUpdateInput
  ) {}
}
