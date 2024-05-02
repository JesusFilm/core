import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, Resource, ResourceStatus } from '.prisma/api-nexus-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { User } from '@core/nest/common/firebaseClient'
import { CurrentUser } from '@core/nest/decorators/CurrentUser'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import {
  Channel,
  GoogleAuthInput,
  GoogleAuthResponse,
  PrivacyStatus,
  ResourceCreateInput,
  ResourceFilter,
  ResourceFromGoogleDriveInput,
  ResourceUpdateInput
} from '../../__generated__/graphql'
import { BullMQService } from '../../lib/bullMQ/bullMQ.service'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService'
import { GoogleDriveService } from '../../lib/google/drive.service'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudFlareService: CloudFlareService,
    private readonly bullMQService: BullMQService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async resources(
    @CaslAccessible('Resource') accessibleResources: Prisma.ResourceWhereInput,
    @Args('where') where?: ResourceFilter
  ): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }
    if (where?.nexusId != null) filter.nexusId = where.nexusId

    return await this.prismaService.resource.findMany({
      where: {
        AND: [accessibleResources, filter]
      },
      orderBy: { createdAt: 'desc' },
      include: { resourceLocalizations: true },
      take: where?.limit ?? undefined
    })
  }

  @Query()
  async resource(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Resource | null> {
    const resource = await this.prismaService.resource.findUnique({
      where: {
        id
      },
      include: {
        resourceLocalizations: true,
        nexus: { include: { userNexuses: true } }
      }
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Read, subject('Resource', resource)))
      throw new GraphQLError('user is not allowed to view resource', {
        extensions: { code: 'FORBIDDEN' }
      })
    return resource
  }

  @Mutation()
  async resourceCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: ResourceCreateInput
  ): Promise<Resource | undefined> {
    const id = uuidv4()
    return await this.prismaService.$transaction(async (tx) => {
      await this.prismaService.resource.create({
        data: {
          ...input,
          id,
          status: ResourceStatus.published
        }
      })
      const resource = await tx.resource.findUnique({
        where: { id },
        include: {
          resourceLocalizations: true,
          nexus: { include: { userNexuses: true } }
        }
      })
      if (resource == null)
        throw new GraphQLError('resource not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!ability.can(Action.Create, subject('Resource', resource)))
        throw new GraphQLError('user is not allowed to create resource', {
          extensions: { code: 'FORBIDDEN' }
        })
      return resource
    })
  }

  @Mutation()
  async resourceUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: ResourceUpdateInput
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.findUnique({
      where: { id },
      include: {
        nexus: { include: { userNexuses: true } }
      }
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Update, subject('Resource', resource)))
      throw new GraphQLError('user is not allowed to update resource', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.resource.update({
      where: { id },
      data: {
        name: input.name ?? undefined
      },
      include: {
        resourceLocalizations: true
      }
    })
  }

  @Mutation()
  async resourceDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.findUnique({
      where: { id },
      include: { nexus: { include: { userNexuses: true } } }
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Delete, subject('Resource', resource)))
      throw new GraphQLError('user is not allowed to delete resource', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.resource.update({
      where: {
        id
      },
      data: {
        status: ResourceStatus.deleted
      },
      include: {
        resourceLocalizations: true
      }
    })
  }

  @Mutation()
  async resourceFromGoogleDrive(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('input') input: ResourceFromGoogleDriveInput
  ): Promise<Resource[]> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await input.fileIds.forEach(async (fileId) => {
      const driveFile = await this.googleDriveService.getFile({
        fileId,
        accessToken: input.authCode ?? ''
      })
      if (
        driveFile == null ||
        driveFile.id == null ||
        driveFile.name == null ||
        driveFile.mimeType == null
      )
        throw new GraphQLError('file not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const fileUrl = this.googleDriveService.getFileUrl(fileId)
      await this.googleDriveService.setFilePermission({
        fileId,
        accessToken: input.authCode ?? ''
      })
      const res = await this.cloudFlareService.uploadToCloudflareByUrl(
        fileUrl,
        driveFile.name,
        userId
      )
      console.log('CLOUD FLARE', res)

      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: driveFile.name,
          nexusId: nexus.id,
          status: 'published',
          createdAt: new Date(),
        }
      })

      await this.prismaService.resourceSource.create({
        data: {
          id: uuidv4(),
          resourceId: resource.id,
          videoGoogleDriveId: driveFile.id,
          videoMimeType: driveFile.mimeType,
          videoGoogleDriveRefreshToken: input.authCode ?? ''
        }
      })
    })

    return await this.prismaService.resource.findMany({
      where: { resourceSource: { videoGoogleDriveId: { in: input.fileIds } } },
      include: { resourceSource: true }
    })
  }

  @Mutation()
  async resourceFromTemplate(
    @CurrentUserId() userId: string,
    @Args('nexusId') nexusId: string,
    @Args('tokenId') tokenId: string,
    @Args('spreadsheetId') spreadsheetId: string,
    @Args('drivefolderId') drivefolderId: string
  ): Promise<Resource[]> {
    console.log('Resource From Template . . .')
    const nexus = await this.prismaService.nexus.findUnique({
      where: {
        id: nexusId,
        userNexuses: { every: { userId } }
      }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    const googleAccessToken =
      await this.prismaService.googleAccessToken.findUnique({
        where: { id: tokenId }
      })

    if (googleAccessToken === null) {
      throw new Error('Invalid tokenId')
    }
    console.log('Downloading Template . . .')
    const rows = await this.googleDriveService.handleGoogleDriveOperations(
      tokenId,
      spreadsheetId,
      drivefolderId
    )
    console.log('Total Data', rows.length)

    const batchResources: Array<{ resource: Resource; channel?: Channel }> = []

    for (const row of rows) {
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: row.filename ?? '',
          nexusId: nexus.id,
          status: row.channelData?.id !== null ? 'processing' : 'published',
          createdAt: new Date(),
          category: row.category,
          privacy: row.privacy as PrivacyStatus,
          resourceLocalizations: {
            create: {
              title: row.title ?? '',
              description: row.description ?? '',
              keywords: row.keywords ?? '',
              language: row.spoken_language ?? ''
            }
          },
          resourceSource: {
            create: {
              videoMimeType: row.driveFile?.mimeType ?? '',
              videoGoogleDriveId: row.driveFile?.id ?? '',
              videoGoogleDriveRefreshToken: googleAccessToken.refreshToken
            }
          }
        }
      })
      if (row.channelData?.id !== undefined) {
        batchResources.push({ resource, channel: row.channelData })
      }
    }

    const channels = batchResources
      .filter((item, index, self) => {
        return (
          index === self.findIndex((t) => t.channel?.id === item.channel?.id) &&
          item.channel !== undefined
        )
      })
      .map((item) => item.channel)

    console.log('Batches', channels.length)

    for (const channel of channels) {
      if (channel === undefined) continue
      const resources = batchResources
        .filter((item) => {
          return item.channel?.id === channel.id
        })
        .map((item) => item.resource)
      console.log('Batche Count: ', resources.length)
      await this.bullMQService.createBatch(
        uuidv4(),
        nexusId,
        channel,
        resources
      )
    }

    return batchResources.map((item) => item.resource)
  }

  @Mutation()
  async getGoogleAccessToken(
    @CurrentUserId() userId: string,
    @CurrentUser() user: User,
    @Args('input') input: GoogleAuthInput
  ): Promise<GoogleAuthResponse> {
    const { accessToken, refreshToken } =
      await this.googleOAuthService.exchangeAuthCodeForTokens(
        input.authCode,
        input.url
      )
    const tokenRecord = await this.prismaService.googleAccessToken.create({
      data: {
        refreshToken
      }
    })

    return {
      id: tokenRecord.id,
      accessToken
    }
  }
}
