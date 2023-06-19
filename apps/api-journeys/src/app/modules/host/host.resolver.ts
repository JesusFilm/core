import { Args, Mutation, Resolver, Query } from '@nestjs/graphql'
import { UserInputError } from 'apollo-server-errors'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import {
  Host,
  HostUpdateInput,
  HostCreateInput
} from '../../__generated__/graphql'

import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from '../journey/journey.service'

@Resolver('Host')
export class HostResolver {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  async hosts(
    @CurrentUserId() userId: string,
    @Args('teamId') teamId: string
  ): Promise<Host[]> {
    return await this.prismaService.host.findMany({
      where: { teamId, team: { userTeams: { some: { userId } } } }
    })
  }

  @Mutation()
  async hostCreate(
    @Args('teamId') teamId: string,
    @Args('input') input: HostCreateInput
  ): Promise<Host> {
    const host = {
      teamId,
      ...input
    }
    return await this.prismaService.host.create({ data: host })
  }

  @Mutation()
  // for future dev:  use teamID prop in future once RoleGuards are in
  async hostUpdate(
    @Args('id') id: string,
    @Args('input') input: HostUpdateInput
  ): Promise<Host> {
    if (input.title === null)
      throw new UserInputError('host title cannot be set to null')
    return await this.prismaService.host.update({
      where: { id },
      data: { ...input, title: input.title ?? undefined }
    })
  }

  @Mutation()
  // for future dev: use teamID prop in future once RoleGuards are in
  async hostDelete(@Args('id') id: string): Promise<Host> {
    const journeysWithHost = await this.journeyService.getAllByHost(id)
    if (journeysWithHost.length > 1)
      throw new UserInputError('this host is used in other journeys')
    return await this.prismaService.host.delete({
      where: {
        id
      }
    })
  }
}
