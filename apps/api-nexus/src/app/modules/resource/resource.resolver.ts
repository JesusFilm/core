import { unlink } from 'fs';

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import Bull from 'bull';
import { google } from 'googleapis';
// import { google } from 'googleapis';
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
import { BatchService } from '../../lib/batch/batchService';
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService';
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';
import {
  BullMQService,
  UploadYoutubeTemplateTask,
} from '../bullMQ/bullMQ.service';

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

    // const accessToken = await this.getNewAccessToken(
    //   googleAccessToken.refreshToken,
    // );

    const accessToken = await this.googleOAuthService.getNewAccessToken(
      googleAccessToken.refreshToken,
    );

    const rows = await this.googleDriveService.handleGoogleDriveOperations(
      tokenId,
      spreadsheetId,
      drivefolderId,
    );

    const batchResource: Array<{ resource: Resource; channel?: Channel }> = [];

    for (const row of rows) {
      // const { fileId, filename, title, description, keywords, category } = row;

      // const fileUrl = this.googleDriveService.getFileUrl(row.fileId);
      // await this.googleDriveService.setFilePermission({
      //   fileId: row.fileId,
      //   accessToken,
      // });

      // const res = await this.cloudFlareService.uploadToCloudflareByUrl(
      //   fileUrl,
      //   filename: row.filename,
      //   'ben',
      // );
      // console.log('CLOUD FLARE', res?.result?.uid ?? '');

      // await this.cloudFlareService.makeVideoPublic(res?.result?.uid ?? '');

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

      batchResource.push({
        resource,
        channel: (row.channel as Channel) ?? undefined,
      });
    }

    // TODO: Create batch job here
    // if (batchResource.channel instanceof Channel) {
    //   await this.batchService.createBatch(filename, nexusId, row.channel);
    // }
    // batchResource.filter()

    return await this.prismaService.resource.findMany({
      where: {
        nexusId,
        nexus: {
          userNexuses: {
            every: { userId },
          },
        },
      },
      include: { localizations: true },
    });
  }

  @Mutation()
  async getGoogleAccessToken(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('input') input: GoogleAuthInput,
  ): Promise<GoogleAuthResponse> {
    // const { accessToken, refreshToken } = await this.exchangeAuthCodeForTokens(
    //   input.authCode,
    //   input.url,
    //   process.env.GOOGLE_CLIENT_ID ?? '',
    //   process.env.GOOGLE_CLIENT_SECRET ?? '',
    // );

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

  // @Mutation()
  // async uploadToYoutube(
  //   @CurrentUserId() userId: string,
  //   @CurrentUser() user: User,
  //   @Args('channelId') channelId: string,
  //   @Args('resourceId') resourceId: string,
  // ): Promise<boolean> {
  //   const resource = await this.prismaService.resource.findUnique({
  //     where: { id: resourceId },
  //     include: { localizations: true },
  //   });

  //   const filePath = await this.cloudFlareService.downloadFile(
  //     resource?.cloudflareId ?? '',
  //     resource?.id ?? '',
  //   );
  //   console.log('filePath', filePath);

  //   const channel = await this.prismaService.channel.findUnique({
  //     where: { id: channelId },
  //     include: { youtube: true },
  //   });

  //   const accessToken = await this.googleOAuthService.getNewAccessToken(
  //     channel?.youtube?.refreshToken ?? '',
  //   );

  //   await this.youtubeService.uploadVideo(
  //     accessToken,
  //     filePath,
  //     channel?.youtube?.youtubeId ?? '',
  //     resource?.localizations?.[0]?.title ?? 'Nexus Video Title',
  //     resource?.localizations?.[0]?.description ?? 'Nexus Video Description',
  //   );

  //   unlink(filePath, (err) => {
  //     if (err !== null) {
  //       console.error('Error deleting file:', err);
  //       return;
  //     }
  //     console.log('File deleted successfully');
  //   });

  //   return true;
  // }

  // private async handleGoogleDriveOperations(
  //   tokenId: string,
  //   spreadsheetId: string,
  //   drivefolderId: string,
  // ): Promise<SpreadsheetRow[]> {
  //   const googleAccessToken =
  //     await this.prismaService.googleAccessToken.findUnique({
  //       where: { id: tokenId },
  //     });

  //   if (googleAccessToken === null) {
  //     throw new Error('Invalid tokenId');
  //   }

  //   const accessToken = await this.getNewAccessToken(
  //     googleAccessToken.refreshToken,
  //   );

  //   // const firstSheetName = await this.getFirstSheetName(spreadsheetId, accessToken);

  //   // const spreadsheetData = await this.downloadSpreadsheet(
  //   //   spreadsheetId,
  //   //   firstSheetName
  //   //   accessToken,
  //   // );

  //   const firstSheetName = await this.googleSheetsService.getFirstSheetName(spreadsheetId, accessToken);
  //   const spreadsheetData = await this.googleSheetsService.downloadSpreadsheet(spreadsheetId, firstSheetName, accessToken);

  //   const spreadsheetRows: SpreadsheetRow[] = [];

  //   for (const [
  //     filename,
  //     title,
  //     description,
  //     keywords,
  //     category,
  //     privacy,
  //   ] of spreadsheetData) {
  //     const fileId = await this.googleDriveService.findFile(
  //       this.youtubeService.authorize(accessToken),
  //       drivefolderId,
  //       filename,
  //     );
  //     if (fileId !== null) {
  //       console.log('driveFile', fileId);
  //       const row: SpreadsheetRow = {
  //         fileId,
  //         filename,
  //         title,
  //         description,
  //         keywords,
  //         category,
  //         privacy,
  //       };
  //       spreadsheetRows.push(row);
  //     }
  //   }

  //   return spreadsheetRows;
  // }

  // private async getNewAccessToken(refreshToken: string): Promise<string> {
  //   const refreshTokenUrl = 'https://oauth2.googleapis.com/token';

  //   const response = await fetch(refreshTokenUrl, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     body: new URLSearchParams({
  //       client_id: process.env.GOOGLE_CLIENT_ID ?? '',
  //       client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  //       refresh_token: refreshToken,
  //       grant_type: 'refresh_token',
  //     }),
  //   });

  //   const data = await response.json();
  //   return data.access_token;
  // }

  // private async getFirstSheetName(
  //   spreadsheetId: string,
  //   accessToken: string,
  // ) {
  //   const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  //   const response = await fetch(metadataUrl, {
  //     method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });
  //   const metadata = await response.json();
  //   const firstSheetName = metadata.sheets[0].properties.title;
  //   return firstSheetName;
  // }

  // private async downloadSpreadsheet(
  //   spreadsheetId: string,
  //   sheetName: string,
  //   accessToken: string,
  // ): Promise<any> {
  //   // const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1`;
  //   const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}`;
  //   const response = await fetch(sheetsApiUrl, {
  //     method: 'GET',
  //     headers: {
  //       Authorization: `Bearer ${accessToken}`,
  //     },
  //   });
  //   const data = await response.json();
  //   return data.values;
  // }

  // private async exchangeAuthCodeForTokens(
  //   authCode: string,
  //   redirectUri: string,
  //   clientId: string,
  //   clientSecret: string,
  // ): Promise<{ accessToken: string; refreshToken: string }> {
  //   const tokenExchangeUrl = 'https://oauth2.googleapis.com/token';
  //   const response = await fetch(tokenExchangeUrl, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     body: new URLSearchParams({
  //       code: authCode,
  //       client_id: clientId,
  //       client_secret: clientSecret,
  //       redirect_uri: redirectUri,
  //       grant_type: 'authorization_code',
  //     }),
  //   });

  //   const data = await response.json();
  //   return {
  //     accessToken: data.access_token,
  //     refreshToken: data.refresh_token,
  //   };
  // }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  // async findFile(auth, folderId, fileName) {
  //   const drive = google.drive({ version: 'v3', auth });
  //   const driveResponse = await drive.files.list({
  //     q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
  //     fields: 'files(id, name)',
  //   });

  //   return driveResponse?.data?.files?.[0]?.id ?? null;
  // }
}

// interface SpreadsheetRow {
//   fileId: string;
//   filename: string;
//   title: string;
//   description: string;
//   keywords: string;
//   category: string;
//   privacy: string;
// }
