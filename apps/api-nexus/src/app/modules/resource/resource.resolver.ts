import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import Bull from 'bull';
import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import { Prisma, Resource } from '.prisma/api-nexus-client';
import { User } from '@core/nest/common/firebaseClient';
import { CurrentUser } from '@core/nest/decorators/CurrentUser';
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId';

import {
  BatchJobInput,
  Channel,
  GoogleAuthInput,
  GoogleAuthResponse,
  PrivacyStatus,
  ResourceCreateInput,
  ResourceFilter,
  ResourceFromGoogleDriveInput,
  ResourceUpdateInput,
} from '../../__generated__/graphql';
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import { BatchService } from '../batch/batchService';
import {
  BullMQService,
  UploadYoutubeTemplateTask,
} from '../bullMQ/bullMQ.service';
import { GoogleDriveService } from '../google-drive/googleDriveService';

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudFlareService: CloudFlareService,
    private readonly youtubeService: YoutubeService,
    private readonly bullMQService: BullMQService,
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly batchService: BatchService,
  ) {}

  @Query()
  async resources(
    // @CurrentUserId() userId: string,
    @Args('where') where?: ResourceFilter,
  ): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {};
    if (where?.ids != null) filter.id = { in: where?.ids };
    filter.status = where?.status ?? 'published';
    filter.nexusId = where?.nexusId ?? undefined;

    const resources = await this.prismaService.resource.findMany({
      where: {
        AND: [
          filter,
          {
            nexus: {
              userNexuses: {},
            },
          },
        ],
      },
      include: { localizations: true },
      take: where?.limit ?? undefined,
    });

    return resources;
  }

  @Query()
  async resource(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<Resource | null> {
    const filter: Prisma.ResourceWhereUniqueInput = { id };
    const resource = await this.prismaService.resource.findUnique({
      where: {
        id,
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }],
      },
    });
    return resource;
  }

  @Mutation()
  async resourceBatchJob(
    @Args('input') input: BatchJobInput,
  ): Promise<Array<Bull.Job<unknown>>> {
    const batchJob = await this.bullMQService.createBatchJob(
      {
        id: input.batch.id,
        batchName: input.batch.batchName,
      },
      await Promise.all(
        input.resources.map(async (item) => {
          const channel = await this.prismaService.channel.findUnique({
            where: { id: item?.channel },
            include: { youtube: true },
          });
          const resource = await this.prismaService.resource.findUnique({
            where: { id: item?.channel },
            include: { googleDrive: true },
          });
          const ben: UploadYoutubeTemplateTask = {
            channel: {
              channelId: channel?.youtube?.channelId ?? 'N/A',
              refreshToken: channel?.youtube?.refreshToken ?? 'N/A',
            },
            resource: {
              driveId: resource?.googleDrive?.driveId ?? 'N/A',
              refreshToken: resource?.googleDrive?.refreshToken ?? 'N/A',
            },
          };
          return ben;
        }),
      ),
    );

    return batchJob;
  }

  @Mutation()
  async resourceCreate(
    // @CurrentUserId() userId: string,
    @Args('input') input: ResourceCreateInput,
  ): Promise<Resource | undefined> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId },
    });
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' },
      });

    const resource = await this.prismaService.resource.create({
      data: {
        ...input,
        nexusId: nexus.id,
        id: uuidv4(),
        sourceType: 'other',
      },
    });

    return resource;
  }

  @Mutation()
  async resourceUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input: ResourceUpdateInput,
  ): Promise<Resource> {
    return await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } },
      },
      data: {
        name: input.name ?? undefined,
      },
    });
  }

  @Mutation()
  async resourceDelete(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } },
      },
      data: {
        status: 'deleted',
      },
    });
    return resource;
  }

  @Mutation()
  async resourceFromGoogleDrive(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('input') input: ResourceFromGoogleDriveInput,
  ): Promise<Resource[]> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } },
    });
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await input.fileIds.forEach(async (fileId) => {
      const driveFile = await this.googleDriveService.getFile({
        fileId,
        accessToken: input.authCode ?? '',
      });
      if (driveFile == null)
        throw new GraphQLError('file not found', {
          extensions: { code: 'NOT_FOUND' },
        });

      const fileUrl = this.googleDriveService.getFileUrl(fileId);
      await this.googleDriveService.setFilePermission({
        fileId,
        accessToken: input.authCode ?? '',
      });
      const res = await this.cloudFlareService.uploadToCloudflareByUrl(
        fileUrl,
        driveFile.name,
        userId,
      );
      console.log('CLOUD FLARE', res);

      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: driveFile.name,
          nexusId: nexus.id,
          status: 'published',
          createdAt: new Date(),
          sourceType: 'googleDrive',
        },
      });

      await this.prismaService.googleDriveResource.create({
        data: {
          id: uuidv4(),
          resourceId: resource.id,
          driveId: driveFile.id,
          mimeType: driveFile.mimeType,
          refreshToken: input.authCode ?? '',
        },
      });
    });

    return await this.prismaService.resource.findMany({
      where: { googleDrive: { driveId: { in: input.fileIds } } },
      include: { googleDrive: true },
    });
  }

  @Mutation()
  async resourceFromTemplate(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('nexusId') nexusId: string,
    @Args('tokenId') tokenId: string,
    @Args('spreadsheetId') spreadsheetId: string,
    @Args('drivefolderId') drivefolderId: string,
  ): Promise<Resource[]> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: {
        id: nexusId,
        userNexuses: { every: { userId } },
      },
    });
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' },
      });

    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId },
      });

    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId');
    }

    const rows = await this.googleDriveService.handleGoogleDriveOperations(
      tokenId,
      spreadsheetId,
      drivefolderId,
    );

    const batchResources: Array<{ resource: Resource; channel?: Channel }> = [];

    for (const row of rows) {
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: row.filename ?? '',
          nexusId: nexus.id,
          status: 'processing',
          sourceType: 'template',
          createdAt: new Date(),
          category: row.category,
          privacy: row.privacy as PrivacyStatus,
          localizations: {
            create: {
              title: row.title ?? '',
              description: row.description ?? '',
              keywords: row.keywords ?? '',
              language: row.spoken_language ?? '',
            },
          },
          googleDrive: {
            create: {
              mimeType: row.driveFile?.mimeType ?? '',
              driveId: row.driveFile?.id ?? '',
              refreshToken: googleAccessToken.refreshToken,
            },
          },
        },
      });
      batchResources.push({
        resource,
        channel: (row.channel as Channel) ?? undefined,
      });
    }

    const channels = Array.from(
      new Set(batchResources.map((item) => item.channel)),
    );

    for (const channel of channels) {
      const resources = batchResources
        .filter((item) => {
          return item.channel?.id === channel?.id;
        })
        .map((item) => item.resource);
      if (channel !== null && resources.length > 0) {
        await this.batchService.createBatch(
          uuidv4(),
          nexusId,
          channel as Channel,
          resources,
        );
      }
    }

    return batchResources.map((item) => item.resource);
  }

  @Mutation()
  async getGoogleAccessToken(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('input') input: GoogleAuthInput,
  ): Promise<GoogleAuthResponse> {
    const { accessToken, refreshToken } =
      await this.googleOAuthService.exchangeAuthCodeForTokens(
        input.authCode,
        input.url,
      );
    const tokenRecord = await this.prismaService.googleAccessToken.create({
      data: {
        refreshToken,
      },
    });

    return {
      id: tokenRecord.id,
      accessToken,
    };
  }
}
