import { Injectable } from '@nestjs/common';

import { Batch } from '.prisma/api-nexus-client';

import { Channel, Resource } from '../../__generated__/graphql';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BatchService {
  constructor(private readonly prismaService: PrismaService) {}

  async createBatch(
    batchName: string,
    nexusId: string,
    channel: Channel,
    batchResources: Array<{
      resource: Resource;
    }>,
  ): Promise<Batch> {
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId,
        channelId: channel.id,
        resources: {
          connect: batchResources.map((batchResource) => ({
            id: batchResource.resource.id,
          })),
        },
      },
    });

    return batch;
  }
}
