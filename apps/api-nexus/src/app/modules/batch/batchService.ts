import { Injectable } from '@nestjs/common';

import { Batch } from '.prisma/api-nexus-client';

import { Channel } from '../../__generated__/graphql';
import { PrismaService } from '../../lib/prisma.service';

@Injectable()
export class BatchService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBatch(
    batchName: string,
    nexusId: string,
    channel: Channel,
    resources: Array<{ id: string }>,
  ): Promise<Batch> {
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId,
        channelId: channel.id,
        resources: {
          connect: resources.map((resource) => ({
            id: resource.id,
          })),
        },
      },
    });

    return batch;
  }
}
