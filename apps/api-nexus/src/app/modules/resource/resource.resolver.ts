import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
import { GoogleSheetsService } from '../../lib/googleAPI/googleSheetsService';
import { GoogleOAuthService } from '../../lib/googleOAuth/googleOAuth';
import {
  LanguagePrismaService,
  PrismaService,
  VideoPrismaService,
} from '../../lib/prisma.service';
import { BatchService } from '../batch/batchService';
import { BullMQService } from '../bullMQ/bullMQ.service';
import { GoogleDriveService } from '../google-drive/googleDriveService';

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly videoPrismaService: VideoPrismaService,
    private readonly languagePrismaService: LanguagePrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudFlareService: CloudFlareService,
    private readonly bullMQService: BullMQService,
    private readonly batchService: BatchService,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  @Query()
  async resources(
    @CurrentUserId() userId: string,
    @Args('where') where?: ResourceFilter,
  ): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {};
    if (where?.ids != null) filter.id = { in: where?.ids };
    filter.nexusId = where?.nexusId ?? undefined;

    const resources = await this.prismaService.resource.findMany({
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
          {
            NOT: { status: 'deleted' },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
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
      include: { localizations: true },
    });
    return resource;
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
    @Args('nexusId') nexusId: string,
    @Args('tokenId') tokenId: string,
    @Args('spreadsheetId') spreadsheetId: string,
    @Args('drivefolderId') drivefolderId: string,
  ): Promise<Resource[]> {
    console.log('Resource From Template . . .');
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

    const { accessToken, data } =
      await this.googleDriveService.getSpreadsheetData(tokenId, spreadsheetId);

    const { templateType, spreadsheetData } =
      await this.googleDriveService.populateSpreadsheetData(
        accessToken,
        drivefolderId,
        data,
      );

    if (templateType === 'upload') {
      console.log('IN UPLOAD');
      console.log('spreadsheetData', spreadsheetData);
      const batchResources =
        await this.batchService.createUploadResourceFromSpreadsheet(
          nexus.id,
          googleAccessToken.refreshToken,
          spreadsheetData,
        );

      console.log('batchResources', batchResources);

      const preparedBatchJobs =
        this.batchService.prepareBatchResourcesForUploadBatchJob(
          batchResources,
        );

      console.log('preparedBatchJobs', preparedBatchJobs);

      for (const preparedBatchJob of preparedBatchJobs) {
        await this.bullMQService.createUploadBatch(
          uuidv4(),
          nexusId,
          preparedBatchJob.channel,
          preparedBatchJob.resources,
        );
      }
      return batchResources.map((item) => item.resource);
    } else if (templateType === 'localization') {
      console.log('IN LOCALIZATION');
      console.log('spreadsheetData', spreadsheetData);
      const batchLocalizations =
        await this.batchService.createResourcesLocalization(
          googleAccessToken.refreshToken,
          spreadsheetData,
        );
      console.log('batchLocalizations', batchLocalizations);
      const preparedBatchJobs =
        this.batchService.prepareBatchResourceLocalizationsForBatchJob(
          batchLocalizations,
        );
      console.log('preparedBatchJobs', preparedBatchJobs);
      for (const preparedBatchJob of preparedBatchJobs) {
        await this.bullMQService.createLocalizationBatch(
          uuidv4(),
          nexusId,
          preparedBatchJob.videoId,
          preparedBatchJob.channel,
          preparedBatchJob.localizations,
        );
      }
      return [];
    }
    return [];
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

  @Mutation()
  async resourceExportData(
    @Args('input') input: { id: string; folderId: string },
  ): Promise<{ name: string }> {
    const videoCount = await this.videoPrismaService.video.count();
    const languagecount = await this.languagePrismaService.language.count();

    const videos = await this.videoPrismaService.video.findMany({
      take: 2,
      include: {
        title: true,
        variants: true,
      },
    });

    // const columnHeaders = Object.keys(videos[0]);

    const columnHeaders = [
      'media-component-id',
      'title',
      'description',
      'description-long',
      'language-id',
      'language-name-en',
      'language-native',
      'language-bcp47',
      'language-iso',
      'media-component-questions',
      'meta-data-language-tag',
      'length',
      'language-country',
    ];

    const spreadsheetData = [columnHeaders];

    videos.forEach(async (video) => {
      const videoLanguage = await this.languagePrismaService.language.findFirst(
        {
          where: {
            id: video.primaryLanguageId,
          },
        },
      );

      const id = video.id ?? '';
      const label = video.title.map((title) => title.value).toString() ?? '';
      const snippet =
        video.snippet
          .map(
            (snip: { value: string; primary: boolean; languageId: string }) =>
              snip.value,
          )
          .toString() ?? '';
      const description =
        video.description
          .map(
            (desc: { value: string; primary: boolean; languageId: string }) =>
              desc.value,
          )
          .toString() ?? '';
      const primaryLanguageId = video.primaryLanguageId ?? '';
      const languageName =
        videoLanguage?.name
          ?.map(
            (lang: { value: string; primary: boolean; languageId: string }) =>
              lang.value,
          )
          .toString() ?? '';
      const languageBcp = videoLanguage?.bcp47 ?? '';
      const languageIso = videoLanguage?.iso3 ?? '';
      const studyQuestions =
        video.studyQuestions
          .map(
            (studyQuestion: {
              value: string;
              primary: boolean;
              languageId: string;
            }) => studyQuestion.value,
          )
          .toString() ?? '';
      const image = video.image ?? '';

      video.variants.forEach(async (variant) => {
        const duration = variant.duration?.toString() ?? '';

        const variantLanguage =
          await this.languagePrismaService.language.findFirst({
            where: {
              id: variant.languageId,
            },
          });

        const languageNative =
          variantLanguage?.name
            ?.map(
              (lang: { value: string; primary: boolean; languageId: string }) =>
                lang.value,
            )
            .toString() ?? '';

        spreadsheetData.push([
          id,
          label,
          snippet,
          description,
          primaryLanguageId,
          languageName,
          languageNative,
          languageBcp,
          languageIso,
          studyQuestions,
          '',
          duration,
          '',
        ]);
      });
    });

    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: input.id },
      });

    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId');
    }

    const accessToken = await this.googleOAuthService.getNewAccessToken(
      googleAccessToken.refreshToken,
    );

    await this.googleSheetsService.createAndPopulateSpreadsheet(
      spreadsheetData,
      accessToken,
      input.folderId,
    );

    return {
      name: `Video-Count: $ ${videoCount} | Language-Count: ${languagecount}`,
    };
  }
}
