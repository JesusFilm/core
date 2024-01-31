import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

import { Batch, Prisma } from '.prisma/api-nexus-client';
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId';

import { BatchFilter } from '../../__generated__/graphql';
import { PrismaService } from '../../lib/prisma.service';

const BATCH_STATUS_UPDATED = 'batchStatusUpdated';
const pubSub = new PubSub();

@Resolver('Batch')
export class BatchResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  async batches(
    @CurrentUserId() userId: string,
    @Args('where') where?: BatchFilter,
  ): Promise<Batch[]> {
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
      take: where?.limit ?? undefined,
    });

    return batches;
  }

  @Query()
  async batch(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<Batch | null> {
    const filter: Prisma.BatchWhereUniqueInput = { id };
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id,
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }],
      },
    });
    return batch;
  }

  // @Subscription(() => Batch, {
  //   filter: (payload, variables) => payload.batchStatusChanged.id === variables.id,
  // })
  // batchStatusChanged(@Args('id') id: string) {
  //   return pubSub.asyncIterator(BATCH_STATUS_CHANGED);
  // }

  @Subscription(() => 'Batch', {
    filter: (payload, variables) =>
      payload.batchStatusUpdated.id === variables.id,
  })
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  batchStatusUpdated(@Args('id') id: string) {
    return pubSub.asyncIterator(BATCH_STATUS_UPDATED);
  }
}

// // Example method where batch status is updated
// async updateBatchStatus(batchId: string, newStatus: BatchStatus) {
//   // Update the batch status in the database
//   const updatedBatch = await this.prismaService.batch.update({
//     where: { id: batchId },
//     data: { status: newStatus },
//   });

//   // Publish the event
//   pubSub.publish(BATCH_STATUS_CHANGED, { batchStatusChanged: updatedBatch });
// }
