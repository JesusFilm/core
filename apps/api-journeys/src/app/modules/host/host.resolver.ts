import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import {
  Host,
  HostUpdateInput,
  Role,
  UserJourneyRole
} from '../../__generated__/graphql'

import { PrismaService } from '../../lib/prisma.service'

@Resolver('Host')
export class HostResolver {
  constructor(
    // private readonly journeyService: JourneyService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async hostCreate(
    @Args('teamId') teamId: string,
    @Args('name') name: string,
    @Args('location') location: string,
    @Args('avatar1Id') avatar1Id: string,
    @Args('avatar2Id') avatar2Id: string
  ): Promise<Host> {
    const host = {
      id: uuidv4(),
      teamId,
      name,
      location,
      avatar1Id,
      avatar2Id
    }
    return host
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
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
        location: input.location,
        avatar1Id: input.avatar1Id,
        avatar2Id: input.avatar2Id
      }
    })
    return hostToUpdate
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async hostDelete(
    @Args('id') id: string,
    @Args('journeyId') journeyId: HostUpdateInput
  ): Promise<Host> {
    return await this.prismaService.host.delete({
      where: {
        id
      }
    })
  }
}
