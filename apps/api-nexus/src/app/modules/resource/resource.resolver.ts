/* eslint-disable @typescript-eslint/naming-convention */
import { Readable } from 'stream';

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { Upload } from 'graphql-upload-minimal';
import { v4 as uuidv4 } from 'uuid';
import XLSX from 'xlsx';

import { Prisma, Resource } from '.prisma/api-nexus-client';
import { User } from '@core/nest/common/firebaseClient';
import { CurrentUser } from '@core/nest/decorators/CurrentUser';
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId';

import {
  ResourceCreateInput,
  ResourceFilter,
  ResourceFromGoogleDriveInput,
  ResourceUpdateInput,
} from '../../__generated__/graphql';
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService';
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService';
import { PrismaService } from '../../lib/prisma.service';

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudFlareService: CloudFlareService,
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
      include: { googleDrive: true, templateResource: true },
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
      data: { ...input, nexusId: nexus.id, id: uuidv4(), sourceType: 'other' },
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
      await this.prismaService.googleDriveResource.create({
        data: {
          id: uuidv4(),
          resourceId: resource.id,
          driveId: driveFile.id,
          title: driveFile.name,
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
    @Args('file', { type: () => Upload }) file: any,
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

    const fileData = await file.promise;
    const { createReadStream } = fileData;

    const stream = createReadStream();
    const buffer = await this.streamToBuffer(stream);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: SpreadsheetRow[] = XLSX.utils.sheet_to_json(worksheet);

    for (const row of rows) {
      const {
        filename,
        channel,
        title,
        description,
        keywords,
        spoken_language,
        caption_file,
        caption_language,
        category,
        privacy,
        notify_subscribers,
        custom_thumbnail,
        playlist_id,
        is_made_for_kids,
      } = row;

      if (filename !== undefined) {
        const resource = await this.prismaService.resource.create({
          data: {
            id: uuidv4(),
            name: filename,
            nexusId: nexus.id,
            status: 'published',
            sourceType: 'template',
            createdAt: new Date(),
          },
        });

        await this.prismaService.templateResource.create({
          data: {
            resourceId: resource.id,
            filename,
            channel,
            spokenLanguage: spoken_language,
            captionLanguage: caption_language,
            captionFile: caption_file,
            category,
            privacyStatus: 'public',
            notifySubscribers: notify_subscribers,
            customThumbnail: custom_thumbnail,
            playlistId: playlist_id,
            isMadeForKids: is_made_for_kids,
            titles: {
              create: {
                languageEntries: {
                  create: [{ text: title, languageCode: 'en' }],
                },
              },
            },
            descriptions: {
              create: {
                languageEntries: {
                  create: [{ text: description, languageCode: 'en' }],
                },
              },
            },
            keywords: {
              create: keywords.split(',').map((keyword) => ({
                languageEntries: {
                  create: [{ text: keyword.trim(), languageCode: 'en' }],
                },
              })),
            },
          },
        });
      }
    }

    return await this.prismaService.resource.findMany({
      where: {
        id: nexusId,
        nexus: { userNexuses: { every: { userId } } },
      },
      include: { templateResource: true },
    });
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    return await new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}

interface SpreadsheetRow {
  filename: string;
  channel: string;
  title: string;
  description: string;
  keywords: string;
  spoken_language: string;
  caption_file: string;
  caption_language: string;
  category: string;
  privacy: string;
  notify_subscribers: boolean;
  custom_thumbnail: string;
  playlist_id: string;
  is_made_for_kids: boolean;
}
