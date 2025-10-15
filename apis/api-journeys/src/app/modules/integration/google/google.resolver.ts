import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Integration } from '@core/prisma/journeys/client'

import {
  IntegrationGoogleCreateInput,
  IntegrationGoogleUpdateInput
} from '../../../__generated__/graphql'
import { Action, AppAbility } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'

import { IntegrationGoogleService } from './google.service'

@Resolver('IntegrationGoogle')
export class IntegrationGoogleResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly service: IntegrationGoogleService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async integrationGoogleCreate(
    @Args('input') input: IntegrationGoogleCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<Integration> {
    return await this.prisma.$transaction(async (tx) => {
      const integration = await this.service.create(
        {
          teamId: input.teamId,
          code: input.code,
          redirectUri: input.redirectUri
        },
        tx
      )

      if (!ability.can(Action.Read, subject('Integration', integration))) {
        throw new GraphQLError('user is not allowed to create integration', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return integration
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async integrationGoogleUpdate(
    @Args('id') id: string,
    @Args('input') input: IntegrationGoogleUpdateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<Integration> {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })

    if (integration == null)
      throw new GraphQLError('integration not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    if (!ability.can(Action.Manage, subject('Integration', integration))) {
      throw new GraphQLError('user is not allowed to update integration', {
        extensions: { code: 'FORBIDDEN' }
      })
    }

    return await this.service.update(id, {
      code: input.code,
      redirectUri: input.redirectUri
    })
  }
}


