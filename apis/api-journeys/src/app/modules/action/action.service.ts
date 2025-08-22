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

@Injectable()
export class ActionService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly blockService: BlockService
  ) {}
}
