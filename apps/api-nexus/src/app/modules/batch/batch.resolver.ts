import { Args, Query, Resolver } from '@nestjs/graphql';

import { Batch, Prisma } from '.prisma/api-nexus-client';
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId';

import { BatchFilter, BatchTask } from '../../__generated__/graphql';
import { PrismaService } from '../../lib/prisma.service';

// interface BatchWithAverage extends Batch {
//   averagePercent: number;
// }
interface BatchWithProgress extends Batch {
  progress: number;
}

@Resolver('Batch')
export class BatchResolver {
  constructor(private readonly prismaService: PrismaService) {}

  // @Query()
  // async batches(
  //   @CurrentUserId() userId: string,
  //   @Args('where') where?: BatchFilter,
  // ): Promise<Batch[]> {
  //   const filter: Prisma.BatchWhereInput = {};
  //   if (where?.ids != null) filter.id = { in: where?.ids };
  //   filter.nexusId = where?.nexusId ?? undefined;

  //   const batches = await this.prismaService.batch.findMany({
  //     where: {
  //       AND: [
  //         filter,
  //         {
  //           nexus: {
  //             userNexuses: {
  //               every: { userId },
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     include: {
  //       channel: {
  //         include: {
  //           youtube: true,
  //         },
  //       },
  //       resources: true,
  //     },
  //     orderBy: { createdAt: 'desc' },
  //     take: where?.limit ?? 100,
  //   });

  //   const batchesWithAverage = batches.map((batch) => {
  //     const totalPercent = batch.resources.reduce(
  //       (acc, curr) => acc + curr.percent,
  //       0,
  //     );
  //     const averagePercent =
  //       batch.resources.length > 0 ? totalPercent / batch.resources.length : 0;

  //     return {
  //       ...batch,
  //       averagePercent,
  //     };
  //   });
  //   return batchesWithAverage;
  // }

  @Query()
  async batches(
    @CurrentUserId() userId: string,
    @Args('where') where?: BatchFilter,
  ): Promise<BatchWithProgress[]> {
    const filter: Prisma.BatchWhereInput = {};
    if (where?.ids != null) filter.id = { in: where?.ids };
    filter.nexusId = where?.nexusId ?? undefined;

    const batches = await this.prismaService.batch.findMany({
      where: {
        AND: [
          filter,
          {
            nexus: {
              userNexuses: {
                every: { userId },
              },
            },
          },
        ],
      },
      include: {
        tasks: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: where?.limit ?? 100,
    });

    const batchesWithProgress = batches.map((batch) => {
      const progress = this.calculateBatchProgress(batch.tasks as BatchTask[]);
      return {
        ...batch,
        progress,
      };
    });

    return batchesWithProgress;
  }

  private calculateBatchProgress(tasks: BatchTask[]): number {
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(
      (task) => task.status === 'completed',
    ).length;
    return (completedTasks / tasks.length) * 100;
  }

  // @Query()
  // async batch(
  //   @CurrentUserId() userId: string,
  //   @Args('id') id: string,
  // ): Promise<BatchWithAverage | null> {
  //   const batch = await this.prismaService.batch.findUnique({
  //     where: {
  //       id,
  //       AND: [{ nexus: { userNexuses: { some: { userId } } } }],
  //     },
  //     include: {
  //       channel: { include: { youtube: true } },
  //       resources: {
  //         include: {
  //           resource: true,
  //         },
  //       },
  //     },
  //   });

  //   if (batch == null) {
  //     return null;
  //   }

  //   const totalPercent = batch.resources.reduce(
  //     (acc, curr) => acc + curr.percent,
  //     0,
  //   );
  //   const averagePercent =
  //     batch.resources.length > 0 ? totalPercent / batch.resources.length : 0;

  //   return {
  //     ...batch,
  //     averagePercent,
  //   };
  // }

  @Query()
  async batch(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<BatchWithProgress | null> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id,
        AND: [{ nexus: { userNexuses: { some: { userId } } } }],
      },
      include: {
        tasks: true,
      },
    });

    if (batch == null) {
      return null;
    }

    const progress = this.calculateBatchProgress(batch.tasks as BatchTask[]);

    return {
      ...batch,
      progress,
    };
  }
}
