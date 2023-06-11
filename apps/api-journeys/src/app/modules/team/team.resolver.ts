import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { Team } from '.prisma/api-journeys-client'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Team')
export class TeamResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(GqlAuthGuard)
  async teams(@CurrentUserId() userId: string): Promise<Team[]> {
    return await this.prismaService.team.findMany({
      where: { userTeams: { some: { userId } } }
    })
  }

  @Query()
  @UseGuards(GqlAuthGuard)
  async team(@Args('id') id: string): Promise<Team> {
    return await this.prismaService.team.findUniqueOrThrow({
      where: {
        id
      }
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async teamCreate(@Args('input') data): Promise<Team | null> {
    return await this.prismaService.team.create({
      data
    })
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async teamUpdate(
    @Args('id') id: string,
    @Args('input') data
  ): Promise<Team | null> {
    return await this.prismaService.team.update({
      where: {
        id
      },
      data
    })
  }
}
