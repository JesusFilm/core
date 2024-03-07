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
  videoId: string; // Assuming each job targets a single YouTube video
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
  resource: {
    id: string;
    driveId: string;
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
        // resources: {
        //   include: {
        //     resource: { include: { googleDrive: true, localizations: true } },
        //   },
        // },
        // channel: { include: { youtube: true } },
      },
    });

    if (batch == null) {
      throw new Error('Batch not found');
    }

    // const jobs = batch?.resources.map((batchResource) => {
    //   return {
    //     name: 'process',
    //     data: {
    //       batchId: batch.id,
    //       resource: {
    //         id: batchResource.resource.id ?? '',
    //         driveId: batchResource.resource.googleDrive?.driveId ?? '',
    //         refreshToken:
    //           batchResource.resource?.googleDrive?.refreshToken ?? '',
    //         title: batchResource?.resource?.localizations[0]?.title ?? '',
    //         description:
    //           batchResource?.resource?.localizations[0]?.description ?? '',
    //       },
    //       channel: {
    //         id: batch.channel?.id ?? '',
    //         channelId: batch.channel?.youtube?.youtubeId ?? '',
    //         refreshToken: batch.channel?.youtube?.refreshToken ?? '',
    //       },
    //     },
    //   };
    // });

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true },
    });

    const jobs = await Promise.all(
      batch.tasks.map(async (task) => {
        // Fetch the resource associated with the task
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
          name: task.type, // Use the task type as the job name
          data: jobData, // The job data constructed from your task and resource details
        };
      }),
    );

    // return await this.bucketQueue.addBulk(jobs ?? []);
    console.log('jobs', jobs);
    return await this.bucketQueue.addBulk(
      jobs.filter((job) => job.data !== undefined),
    );
    // return []
  }

  // async createLocalizationBatchJob(
  //   batchId: string,
  //   localizations: ResourceLocalization[],
  //   channel: Channel,
  // ): Promise<Array<Bull.Job<unknown>>> {
  //   console.log('createLocalizationBatchJob');

  //   // Group localizations by videoId
  //   const localizationsByVideoId = localizations.reduce<{ [key: string]: ResourceLocalization[] }>((acc, localization) => {
  //     if (!localization.videoId) return acc; // Skip localizations without videoId
  //     if (!acc[localization.videoId]) {
  //       acc[localization.videoId] = [];
  //     }
  //     acc[localization.videoId].push(localization);
  //     return acc;
  //   }, {});

  //   const channelData = await this.prismaService.channel.findUnique({
  //     where: { id: channel.id },
  //     include: { youtube: true },
  //   });
  //   const jobs = Object.entries(localizationsByVideoId).map(([videoId, localization]) => {
  //     const localizationJob: {
  //       name: string;
  //       data: ResourceLocalizationJobData;
  //     } = {
  //       name: 'processLocalization',
  //       data: {
  //         batchId,
  //         localizations: localizations.map(loc => ({
  //           resourceId: loc.id,
  //           title: loc.title,
  //           description: loc.description,
  //           youtubeId: loc.videoId,
  //           tags: [], // Adjust as needed
  //           language: loc.language,
  //         })),
  //         // localization: {
  //         //   resourceId: localization.id,
  //         //   title: localization.title,
  //         //   description: localization.description,
  //         //   youtubeId: localization.videoId,
  //         //   tags: [],
  //         //   language: localization.language,
  //         // },
  //         channel: {
  //           id: channel.id,
  //           channelId: channelData?.youtube?.youtubeId,
  //           refreshToken: channelData?.youtube?.refreshToken,
  //         },
  //       },
  //     };
  //     return localizationJob;
  //   });
  //   return await this.bucketQueue.addBulk(jobs ?? []);
  // }

  async createLocalizationBatchJob(
    batchId: string,
    localizations: ResourceLocalization[],
    channel: Channel,
  ): Promise<Array<Bull.Job<unknown>>> {
    // Group localizations by videoId
    const localizationsByVideoId = localizations.reduce<
      Record<string, ResourceLocalization[]>
    >((acc, localization) => {
      const videoId = localization.videoId ?? 'unknown';
      if (acc[videoId] === undefined) {
        acc[videoId] = [];
      }
      acc[videoId].push(localization);
      return acc;
    }, {});

    const channelData = await this.prismaService.channel.findUnique({
      where: { id: channel.id },
      include: { youtube: true },
    });

    // Create a job for each videoId
    const jobs = Object.entries(localizationsByVideoId).map(
      ([videoId, localizations]) => {
        return {
          name: 'processLocalization',
          data: {
            batchId,
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
        };
      },
    );

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
        // channelId: channel.id,
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
        };
      }),
    });

    await this.createUploadBatchJob(batch.id, channel);

    return batch as unknown as Batch;
  }

  async createLocalizationBatch(
    batchName: string,
    nexusId: string,
    channel: Channel,
    localizations: ResourceLocalization[],
  ): Promise<Batch> {
    console.log('createLocalizationBatch');
    const batch = await this.prismaService.batch.create({
      data: {
        name: batchName,
        nexusId,
        // channelId: channel.id,
      },
    });

    await this.prismaService.batchTask.createMany({
      data: localizations.map((localization) => {
        return {
          batchId: batch.id,
          resourceId: localization.resourceId,
          type: 'localization',
          status: 'pending',
        };
      }),
    });

    await this.createLocalizationBatchJob(batch.id, localizations, channel);

    return batch as unknown as Batch;
  }
}
