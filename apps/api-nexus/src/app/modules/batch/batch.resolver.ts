import { Args, Query, Resolver } from '@nestjs/graphql'

import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { Batch, BatchTask, Prisma } from '.prisma/api-nexus-client'

import { subject } from '@casl/ability'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { GraphQLError } from 'graphql'
import { BatchFilter } from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

interface BatchWithProgress extends Batch {
  progress: number
}

@Resolver('Batch')
export class BatchResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async batches(
    @Args('where') where?: BatchFilter
  ): Promise<BatchWithProgress[]> {
    const filter: Prisma.BatchWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }
    const batches = await this.prismaService.batch.findMany({
      where: {
        AND: [filter]
      },
      include: {
        batchTasks: true
      },
      orderBy: { updatedAt: 'desc' },
      take: where?.limit ?? 100
    })

    const batchesWithProgress = batches.map((batch) => {
      const progress = this.calculateBatchProgress(batch.batchTasks)
      return {
        ...batch,
        progress
      }
    })

    return batchesWithProgress
  }

  private calculateBatchProgress(tasks: BatchTask[]): number {
    if (tasks.length === 0) return 0

    const completedTasks = tasks.filter(
      (task) => task.status === 'completed'
    ).length
    return (completedTasks / tasks.length) * 100
  }

  @Query()
  async batch(
    @CaslAbility() ability: AppAbility,
    @CurrentUserId() _userId: string,
    @Args('id') id: string
  ): Promise<BatchWithProgress | null> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id
      },
      include: {
        batchTasks: true
      }
    })

    if (batch == null) {
      return null
    }
    if (!ability.can(Action.Read, subject('Batch', batch)))
      throw new GraphQLError('user is not allowed to fetch batch', {
        extensions: { code: 'FORBIDDEN' }
      })

    const progress = this.calculateBatchProgress(batch.batchTasks)

    return {
      ...batch,
      progress
    }
  }
}
