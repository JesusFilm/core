import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import Bull, { Queue } from 'bull';

import { Batch, Channel, ResourceLocalization } from '.prisma/api-nexus-client';

import { PrismaService } from '../../lib/prisma.service';

export interface UploadToYoutbeTask {
  channelId: string;
  refreshToken: string;
}

export interface UploadToBucketTask {
  driveId: string;
  refreshToken: string;
}

export interface UploadYoutubeTemplateTask {
  resource: {
    driveId: string;
    refreshToken: string;
  };
  channel: {
    channelId: string;
    refreshToken: string;
  };
}

export interface UploadToBucketToYoutube {
  batchId: string;
  batchTaskId: string;
  resource: {
    id: string;
    driveId: string;
    refreshToken: string;
    title: string;
    description: string;
    language: string;
  };
  channel: {
    id: string;
    channelId: string;
    refreshToken: string;
  };
}

export interface UpdateVideoThumbnail {
  batchId: string;
  resource: {
    id: string;
    driveId: string;
    refreshToken: string;
    videoId: string;
  };
  channel: {
    id: string;
    channelId: string;
    refreshToken: string;
  };
}

// export interface UpdateVideoLocalization {
//   batchId: string;
//   localization: {
//     resourceId: string;
//     title: string;
//     description: string;
//     youtubeId: string | null;
//     tags: string[];
//     language: string;
//   };
//   channel: {
//     id: string;
//     channelId: string;
//     refreshToken: string;
//   };
// }
export interface UpdateVideoLocalization {
  batchId: string;
  batchTaskId: string;
  videoId: string;
  channel: {
    id: string;
    channelId: string;
    refreshToken: string;
  };
  localizations: Array<{
    resourceId: string;
    title: string;
    description: string;
    tags: string[];
    language: string;
  }>;
}

export interface UpdateVideoCaption {
  batchId: string;
  batchTaskId: string;
  resource: {
    id: string;
    driveId: string;
    mimeType: string;
    refreshToken: string;
    videoId: string;
    language: string;
  };
  channel: {
    id: string;
    channelId: string;
    refreshToken: string;
  };
}

// export interface ResourceLocalizationJobData {
//   batchId: string;
//   localization: {
//     resourceId: string;
//     youtubeId: string | null;
//     title: string;
//     description: string;
//     tags: string[];
//     language: string;
//   };
//   channel: {
//     id: string;
//     channelId: string | undefined;
//     refreshToken: string | undefined;
//   };
// }

export interface ResourceLocalizationJobData {
  batchId: string;
  videoId: string;
  channel: {
    id: string;
    channelId: string | undefined;
    refreshToken: string | undefined;
  };
  localizations: Array<{
    resourceId: string;
    title: string;
    description: string;
    tags: string[];
    language: string;
  }>;
}

interface Job {
  name: string;
  data: object;
}

@Injectable()
export class BullMQService {
  constructor(
    private readonly prismaService: PrismaService,
    @InjectQueue('nexus-bucket') private readonly bucketQueue: Queue,
  ) {}

  async createUploadBatchJob(
    batchId: string,
    channel: Channel,
  ): Promise<Array<Bull.Job<unknown>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchId,
      },
      include: {
        tasks: true,
      },
    });

    if (batch == null) {
      throw new Error('Batch not found');
    }

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true },
    });

    const jobs = await Promise.all(
      batch.tasks.map(async (task) => {
        const resource = await this.prismaService.resource.findUnique({
          where: { id: task.resourceId },
          include: {
            googleDrive: true,
            localizations: true,
          },
        });

        if (resource == null) {
          throw new Error('Resource not found');
        }

        const jobData = {
          batchId: batch.id,
          batchTaskId: task.id,
          resource: {
            id: resource.id,
            driveId: resource.googleDrive?.driveId ?? '',
            refreshToken: resource.googleDrive?.refreshToken ?? '',
            title: resource.localizations[0]?.title ?? '',
            description: resource.localizations[0]?.description ?? '',
          },
          channel: {
            id: channel?.id ?? '',
            channelId: channelData?.youtube?.youtubeId ?? '',
            refreshToken: channelData?.youtube?.refreshToken ?? '',
          },
        };

        return {
          name: task.type,
          data: jobData,
        };
      }),
    );

    console.log('jobs', jobs);
    return await this.bucketQueue.addBulk(
      jobs.filter((job) => job.data !== undefined),
    );
  }

  async createLocalizationBatchJob(
    batchId: string,
    videoId: string,
    localizations: ResourceLocalization[],
    channel: Channel,
  ): Promise<Array<Bull.Job<unknown>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchId,
      },
      include: {
        tasks: {
          where: {
            type: 'localization',
          },
        },
      },
    });

    if (batch == null) {
      throw new Error('Batch not found');
    }

    // Group localizations by videoId
    // const localizationsByVideoId = localizations.reduce<
    //   Record<string, ResourceLocalization[]>
    // >((acc, localization) => {
    //   const videoId = localization.videoId ?? 'unknown';
    //   if (acc[videoId] === undefined) {
    //     acc[videoId] = [];
    //   }
    //   acc[videoId].push(localization);
    //   return acc;
    // }, {});

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true },
    });

    const jobs: Job[] = [];

    for (const task of batch.tasks) {
      const resource = await this.prismaService.resource.findUnique({
        where: { id: task.resourceId },
        include: {
          localizations: {
            include: {
              localizedResourceFile: true,
            },
          },
        },
      });

      if (resource == null) {
        throw new Error('Resource not found');
      }

      // for (const localization of resource.localizations) {
      jobs.push({
        name: 'processLocalization',
        data: {
          batchId,
          batchTaskId: task.id,
          videoId,
          channel: {
            id: channel.id,
            channelId: channelData?.youtube?.youtubeId,
            refreshToken: channelData?.youtube?.refreshToken,
          },
          localizations: localizations.map((loc) => ({
            resourceId: loc.resourceId,
            title: loc.title,
            description: loc.description,
            tags: loc.keywords?.split(',') ?? [],
            language: loc.language,
          })),
        },
      });
      // }
    }

    // Create a job for each videoId
    // const jobs = Object.entries(localizationsByVideoId).map(
    //   ([videoId, localizations]) => {
    //     return {
    //       name: 'processLocalization',
    //       data: {
    //         batchId,
    //         batchTaskId: task.id,
    //         videoId,
    //         channel: {
    //           id: channel.id,
    //           channelId: channelData?.youtube?.youtubeId,
    //           refreshToken: channelData?.youtube?.refreshToken,
    //         },
    //         localizations: localizations.map((loc) => ({
    //           resourceId: loc.resourceId,
    //           title: loc.title,
    //           description: loc.description,
    //           tags: loc.keywords?.split(',') ?? [],
    //           language: loc.language,
    //         })),
    //       },
    //     };
    //   },
    // );

    return await this.bucketQueue.addBulk(jobs);
  }

  async createCaptionBatchJob(
    batchId: string,
    channel: Channel,
  ): Promise<Array<Bull.Job<unknown>>> {
    const batch = await this.prismaService.batch.findUnique({
      where: {
        id: batchId,
      },
      include: {
        tasks: {
          where: {
            type: 'caption_processing',
          },
        },
      },
    });

    if (batch == null) {
      throw new Error('Batch not found');
    }

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true },
    });

    const jobs: Job[] = [];

    for (const task of batch.tasks) {
      const resource = await this.prismaService.resource.findUnique({
        where: { id: task.resourceId },
        include: {
          localizations: {
            include: {
              localizedResourceFile: true,
            },
          },
        },
      });

      if (resource == null) {
        throw new Error('Resource not found');
      }

      for (const localization of resource.localizations) {
        jobs.push({
          name: 'processCaption',
          data: {
            batchId,
            batchTaskId: task.id,
            videoId: localization.videoId,
            channel: {
              id: channel.id,
              channelId: channelData?.youtube?.youtubeId,
              refreshToken: channelData?.youtube?.refreshToken,
            },
            resource: {
              driveId: localization.localizedResourceFile?.captionDriveId,
              mimeType: localization.localizedResourceFile?.captionMimeType,
              language: localization.language,
              refreshToken: localization.localizedResourceFile?.refreshToken,
              videoId: localization.videoId,
            },
          },
        });
      }
    }

    return await this.bucketQueue.addBulk(jobs);
  }

  async createUploadBatch(
    batchName: string,
    nexusId: string,
    channel: Channel,
    resources: Array<{ id: string }>,
  ): Promise<Batch> {
    console.log('Creating upload batch...');
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId,
      },
    });

    console.log('Creating upload batch tasks...');
    await this.prismaService.batchTask.createMany({
      data: resources.map((resource) => {
        return {
          batchId: batch.id,
          resourceId: resource.id,
          type: 'video_upload',
          status: 'pending',
          metadata: {
            resource,
            channel,
          },
        };
      }),
    });

    await this.createUploadBatchJob(batch.id, channel);

    return batch as unknown as Batch;
  }

  async createLocalizationBatch(
    batchName: string,
    nexusId: string,
    videoId: string,
    channel: Channel,
    localizations: ResourceLocalization[],
  ): Promise<Batch> {
    console.log('createLocalizationBatch');
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId,
      },
    });

    // task for localization
    await this.prismaService.batchTask.createMany({
      data: localizations.map((localization) => {
        return {
          batchId: batch.id,
          resourceId: localization.resourceId,
          type: 'localization',
          status: 'pending',
          metadata: {
            localization,
            channel,
          },
        };
      }),
    });

    // task for caption
    await this.prismaService.batchTask.createMany({
      data: localizations.map((localization) => {
        return {
          batchId: batch.id,
          resourceId: localization.resourceId,
          type: 'caption_processing',
          status: 'pending',
          metadata: {
            localization,
            channel,
          },
        };
      }),
    });

    await this.createLocalizationBatchJob(
      batch.id,
      videoId,
      localizations,
      channel,
    );
    await this.createCaptionBatchJob(batch.id, channel);

    return batch as unknown as Batch;
  }
}
