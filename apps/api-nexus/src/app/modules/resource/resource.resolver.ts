import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, Resource } from '.prisma/api-nexus-client'
import { User } from '@core/nest/common/firebaseClient'
import { CurrentUser } from '@core/nest/decorators/CurrentUser'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'

import {
  ResourceCreateInput,
  ResourceFilter,
  ResourceFromGoogleDriveInput,
  ResourceUpdateInput
} from '../../__generated__/graphql'
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService'
import { GoogleDriveService } from '../../lib/googleAPI/googleDriveService'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleDriveService: GoogleDriveService,
    private readonly cloudFlareService: CloudFlareService
  ) {}

  @Query()
  async resources(
    @CurrentUserId() userId: string,
    @Args('where') where?: ResourceFilter
  ): Promise<Resource[]> {
    const filter: Prisma.ResourceWhereInput = {}
    if (where?.ids != null) filter.id = { in: where?.ids }
    filter.status = where?.status ?? 'published'
    filter.nexusId = where?.nexusId ?? undefined

    const resources = await this.prismaService.resource.findMany({
      where: {
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }]
      },
      include: { googleDrive: true },
      take: where?.limit ?? undefined
    })

    return resources
  }

  @Query()
  async resource(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<Resource | null> {
    const filter: Prisma.ResourceWhereUniqueInput = { id }
    const resource = await this.prismaService.resource.findUnique({
      where: {
        id,
        AND: [filter, { nexus: { userNexuses: { every: { userId } } } }]
      }
    })
    return resource
  }

  @Mutation()
  async resourceCreate(
    @CurrentUserId() userId: string,
    @Args('input') input: ResourceCreateInput
  ): Promise<Resource | undefined> {
    const nexus = await this.prismaService.nexus.findUnique({
      where: { id: input.nexusId, userNexuses: { every: { userId } } }
    })
    if (nexus == null)
      throw new GraphQLError('nexus not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    const resource = await this.prismaService.resource.create({
      data: { ...input, nexusId: nexus.id, id: uuidv4() }
    })

    return resource
  }

  @Mutation()
  async resourceUpdate(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('input') input: ResourceUpdateInput
  ): Promise<Resource> {
    return await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } }
      },
      data: {
        name: input.name ?? undefined
      }
    })
  }

  @Mutation()
  async resourceDelete(
    @CurrentUserId() userId: string,
    @Args('id') id: string
  ): Promise<Resource> {
    const resource = await this.prismaService.resource.update({
      where: {
        id,
        nexus: { userNexuses: { every: { userId } } }
      },
      data: {
        status: 'deleted'
      }
    })
    return resource
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
      if (driveFile == null)
        throw new GraphQLError('file not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      const resource = await this.prismaService.resource.create({
        data: {
          id: uuidv4(),
          name: driveFile.name,
          nexusId: nexus.id,
          status: 'published',
          createdAt: new Date()
        }
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
      await this.prismaService.googleDriveResource.create({
        data: {
          id: uuidv4(),
          resourceId: resource.id,
          driveId: driveFile.id,
          title: driveFile.name,
          mimeType: driveFile.mimeType,
          refreshToken: input.authCode ?? ''
        }
      })
    })
    return await this.prismaService.resource.findMany({
      where: { googleDrive: { driveId: { in: input.fileIds } } },
      include: { googleDrive: true }
    })
  }
}