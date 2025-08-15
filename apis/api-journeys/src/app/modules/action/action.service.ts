import { Injectable } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import { z } from 'zod'

import { Action, Block } from '@core/prisma/journeys/client'

import {
  EmailActionInput,
  LinkActionInput,
  NavigateToBlockActionInput
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'

import { ACTION_UPDATE_RESET } from './actionUpdateReset'

const emailSchema = z.object({
  email: z.string().email()
})
@Injectable()
export class ActionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly blockService: BlockService
  ) {}

  async emailActionUpdate(
    id: string,
    block: Block,
    input: EmailActionInput
  ): Promise<Action> {
    try {
      await emailSchema.parse({ email: input.email })
    } catch {
      throw new GraphQLError('must be a valid email', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...input,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...ACTION_UPDATE_RESET,
        ...input
      },
      include: { parentBlock: { include: { action: true } } }
    })
  }

  async navigateToBlockActionUpdate(
    id: string,
    block: Block,
    input: NavigateToBlockActionInput
  ): Promise<Action> {
    const stepBlock = await this.blockService.findParentStepBlock(
      block.parentBlockId as string
    )
    if (stepBlock != null && stepBlock.id === input.blockId)
      throw new GraphQLError('blockId cannot be the parent step block id', {
        extensions: { code: 'BAD_USER_INPUT' }
      })

    const inputWithBlockConnection = {
      ...omit(input, 'blockId'),
      block: { connect: { id: input.blockId } }
    }
    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...inputWithBlockConnection,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...ACTION_UPDATE_RESET,
        ...inputWithBlockConnection
      },
      include: { parentBlock: { include: { action: true } } }
    })
  }

  async linkActionUpdate(
    id: string,
    block: Block,
    input: LinkActionInput
  ): Promise<Action> {
    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...input,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...ACTION_UPDATE_RESET,
        ...input
      },
      include: { parentBlock: { include: { action: true } } }
    })
  }
}
