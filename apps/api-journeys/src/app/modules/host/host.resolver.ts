import { Args, Mutation, Resolver, Query } from '@nestjs/graphql'
import { v4 as uuidv4 } from 'uuid'
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
      id: uuidv4(),
      teamId,
      ...input
    }
    await this.prismaService.host.create({ data: host })
    return host
  }

  @Mutation()
  async hostUpdate(
    @Args('id') id: string,
    @Args('input') input: HostUpdateInput
  ): Promise<Host> {
    const host = await this.prismaService.host.findUnique({
      where: { id }
    })
    const hostToUpdate = await this.prismaService.host.update({
      where: { id },
      data: {
        name: input.name ?? host?.name,
        location: input.location ?? host?.location,
        avatar1Id: input.avatar1Id ?? host?.avatar1Id,
        avatar2Id: input.avatar2Id ?? host?.avatar2Id
      }
    })
    return hostToUpdate
  }

  @Mutation()
  async hostDelete(@Args('id') id: string): Promise<Host> {
    return await this.prismaService.host.delete({
      where: {
        id
      }
    })
  }
}
