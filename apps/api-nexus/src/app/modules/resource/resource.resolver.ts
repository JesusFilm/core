import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, Resource, ResourceStatus } from '.prisma/api-nexus-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'

import {
  ResourceCreateInput,
  ResourceFilter,
  ResourceUpdateInput
} from '../../__generated__/graphql'
import { BullMQService } from '../../lib/bullMQ/bullMQ.service'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { CloudFlareService } from '../../lib/cloudFlare/cloudFlareService'
import { GoogleDriveService } from '../../lib/google/drive.service'
import { GoogleOAuthService } from '../../lib/google/oauth.service'
import {
  GoogleSheetsService,
  SpreadsheetTemplateType
} from '../../lib/google/sheets.service'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('Resource')
export class ResourceResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthService: GoogleOAuthService,
    private readonly googleSheetsService: GoogleSheetsService,
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
        resourceLocalizations: true
      }
    })
    if (resource == null)
      throw new GraphQLError('resource not found', {
        extensions: { code: 'user is not allowed to view resource' }
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
          resourceLocalizations: true
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
      where: { id }
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
      where: { id }
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
  async resourceFromTemplate(
    @Args('accessToken') accessToken: string,
    @Args('spreadsheetId') spreadsheetId: string,
    @Args('drivefolderId') drivefolderId: string
  ): Promise<Resource[]> {
    console.log('Resource From Template . . .')
    const { templateType, spreadsheetData } =
      await this.googleSheetsService.getSpreadSheetTemplateData(
        accessToken,
        spreadsheetId,
        drivefolderId
      )
    // CHECK SPREADSHEET TEMPLATE TYPE
    if (templateType === SpreadsheetTemplateType.UPLOAD) {
      // PROCESS UPLOAD TEMPLATE
      return await this.googleSheetsService.processUploadSpreadsheetTemplate(
        accessToken,
        spreadsheetData
      )
    } else if (templateType === SpreadsheetTemplateType.LOCALIZATION) {
      // PR OCESS LOCALIZATION TEMPLATE
      console.log('LOCALIZATION')
      await this.googleSheetsService.processLocalizationTemplateBatches(
        accessToken,
        spreadsheetData
      )
    }
    return []
  }
}
