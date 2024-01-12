import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { google } from 'googleapis';
import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import { Prisma, Resource } from '.prisma/api-nexus-client';
import { User } from '@core/nest/common/firebaseClient';
import { CurrentUser } from '@core/nest/decorators/CurrentUser';
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId';

import {
  GoogleAuthInput,
  GoogleAuthResponse,
  ResourceCreateInput,
  ResourceFilter,
  ResourceFromGoogleDriveInput,
  ResourceUpdateInput,
} from '../../__generated__/graphql';
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService';
import { PrismaService } from '../../lib/prisma.service';
import { YoutubeService } from '../../lib/youtube/youtubeService';

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudFlareService: CloudFlareService,
    private readonly youtubeService: YoutubeService,
  ) {}

  @Query()
  async resources(
    @CurrentUserId() userId: string,
    @Args('where') where?: ResourceFilter,
  ): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {};
    if (where?.ids != null) filter.id = { in: where?.ids };
    filter.status = where?.status ?? 'published';
    filter.nexusId = where?.nexusId ?? undefined;

    const resources = await this.prismaService.resource.findMany({
      where: {
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }],
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
  async resourceCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ResourceCreateInput,
  ): Promise<Resource | undefined> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } },
    });
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' },
      });

    const resource = await this.prismaService.resource.create({
      data: {
        ...input,
        cloudflareId: 'cloudflareId',
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
          cloudflareId: 'cloudflareId',
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

    const rows = await this.handleGoogleDriveOperations(
      tokenId,
      spreadsheetId,
      drivefolderId,
    );

    for (const row of rows) {
      const { fileId, filename, title, description, keywords, category } = row;

      const fileUrl = this.googleDriveService.getFileUrl(fileId);
      await this.googleDriveService.setFilePermission({
        fileId,
        accessToken: tokenId ?? '',
      });

      const res = await this.cloudFlareService.uploadToCloudflareByUrl(
        fileUrl,
        filename,
        'diye',
      );
      console.log('CLOUD FLARE', res);

      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          cloudflareId: res?.result?.uid ?? '',
          name: filename,
          nexusId: nexus.id,
          status: 'published',
          sourceType: 'template',
          createdAt: new Date(),
          category,
          privacy: 'public',
        },
      });

      await this.prismaService.resourceLocalization.create({
        data: {
          resourceId: resource.id,
          title,
          description,
          keywords,
          language: 'en',
        },
      });
    }

    return await this.prismaService.resource.findMany({
      where: {
        id: nexusId,
        nexus: { userNexuses: { every: { userId } } },
      },
      include: { localizations: true },
    });
  }

  @Mutation()
  async getGoogleAccessToken(
    // @CurrentUserId() userId: string,
    // @CurrentUser() user: User,
    @Args('input') input: GoogleAuthInput,
  ): Promise<GoogleAuthResponse> {
    const { accessToken, refreshToken } = await this.exchangeAuthCodeForTokens(
      input.authCode,
      input.url,
      process.env.GOOGLE_CLIENT_ID ?? '',
      process.env.GOOGLE_CLIENT_SECRET ?? '',
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
  //   @Args('resourceId') url: string,

  // ): Promise<unknown> {

  //   // TODO: Downloadfile
  //   // TODO: UploadToYoutube
  // }

  private async handleGoogleDriveOperations(
    tokenId: string,
    spreadsheetId: string,
    drivefolderId: string,
  ): Promise<SpreadsheetRow[]> {
    // const googleAccessToken =
    //   await this.prismaService.googleAccessToken.findUnique({
    //     where: { id: tokenId },
    //   });

    // if (googleAccessToken === null) {
    //   throw new Error('Invalid tokenId');
    // }

    // const accessToken = await this.getNewAccessToken(
    //   googleAccessToken.refreshToken,
    // );

    const spreadsheetData = await this.downloadSpreadsheet(
      spreadsheetId,
      // accessToken,
      tokenId,
    );

    const spreadsheetRows: SpreadsheetRow[] = [];

    for (const [
      filename,
      title,
      description,
      keywords,
      category,
      privacy,
    ] of spreadsheetData) {
      // const fileExists = await this.checkFileExistsInDriveFolder(
      //   filename,
      //   drivefolderId,
      //   accessToken,
      // );

      const fileId = await this.findFile(
        // this.youtubeService.authorize(accessToken),
        this.youtubeService.authorize(tokenId),
        drivefolderId,
        filename,
      );
      
      console.log('driveFile', fileId);

      if (fileId !== null) {
        const row: SpreadsheetRow = {
          fileId,
          filename,
          title,
          description,
          keywords,
          category,
          privacy,
        };
        spreadsheetRows.push(row);
      }
    }

    return spreadsheetRows;
  }

  private async getNewAccessToken(refreshToken: string): Promise<string> {
    const refreshTokenUrl = 'https://oauth2.googleapis.com/token';

    const response = await fetch(refreshTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    return data.access_token;
  }

  private async downloadSpreadsheet(
    spreadsheetId: string,
    accessToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const sheetsApiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1`;
    const response = await fetch(sheetsApiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    console.log('data', data);
    return data.values;
  }

  private async exchangeAuthCodeForTokens(
    authCode: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenExchangeUrl = 'https://oauth2.googleapis.com/token';

    const response = await fetch(tokenExchangeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  private async checkFileExistsInDriveFolder(
    filename: string,
    folderId: string,
    accessToken: string,
  ): Promise<boolean> {
    const driveApiUrl = `https://www.googleapis.com/drive/v3/files?q='${encodeURIComponent(
      folderId,
    )}'+in+parents+and+name='${encodeURIComponent(
      filename,
    )}'&fields=files(id,name)&key=${process.env.GOOGLE_API_KEY}`;
    const response = await fetch(driveApiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    return Boolean(data.files) && data.files.length > 0;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async findFile(auth, folderId, fileName) {
    const drive = google.drive({ version: 'v3', auth });
    const driveResponse = await drive.files.list({
      q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
    });

    // if (err) return console.log('The API returned an error: ' + err);
    //     if (res) {
    //       const files = res.data.files;
    //       if (files) {
    //         if (files.length) {
    //           console.log('File ID:', files[0].id);
    //       } else {
    //           console.log('No files found.');
    //         }
    //       }
    //     }

    if (driveResponse !== null) {
      // console.log('driveResponse', data.files[0])
      return driveResponse?.data?.files?.[0]?.id ?? null
    }

    return null
  }
}

interface SpreadsheetRow {
  fileId: string;
  filename: string;
  title: string;
  description: string;
  keywords: string;
  category: string;
  privacy: string;
}
