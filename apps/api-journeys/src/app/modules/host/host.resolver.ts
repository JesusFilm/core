import { Args, Mutation, Resolver, Query } from '@nestjs/graphql'
import { UserInputError } from 'apollo-server-errors'
import {
  Host,
  HostUpdateInput,
  HostCreateInput
} from '../../__generated__/graphql'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('Host')
export class HostResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async hosts(@Args('teamId') teamId: string): Promise<Host[]> {
    return await this.prismaService.host.findMany({
      where: { teamId }
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
    if (input.title == null)
      throw new UserInputError('host title cannot be undefined or null')
    const hostToUpdate = await this.prismaService.host.update({
      where: { id },
      data: {
        title: input.title,
        location: input.location,
        avatar1Id: input.avatar1Id,
        avatar2Id: input.avatar2Id
      }
    })
    return hostToUpdate
  }

  @Mutation()
  // for future dev: use teamID prop in future once RoleGuards are in
  async hostDelete(@Args('id') id: string): Promise<Host> {
    return await this.prismaService.host.delete({
      where: {
        id
      }
    })
  }
}
