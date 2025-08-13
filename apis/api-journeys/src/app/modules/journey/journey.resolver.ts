import { subject } from '@casl/ability'
import { InjectQueue } from '@nestjs/bullmq'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { Queue } from 'bullmq'
import { GraphQLError } from 'graphql'
import filter from 'lodash/filter'
import isEmpty from 'lodash/isEmpty'
import omit from 'lodash/omit'
import slugify from 'slugify'
import { v4 as uuidv4 } from 'uuid'

import {
  Block,
  Action as BlockAction,
  ChatButton,
  Host,
  Journey,
  JourneyCollection,
  JourneyCustomizationField,
  JourneyTheme,
  Prisma,
  Team,
  UserJourney,
  UserJourneyRole
} from '.prisma/api-journeys-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import {
  PowerBiEmbed,
  getPowerBiEmbed
} from '@core/nest/powerBi/getPowerBiEmbed'

import {
  IdType,
  JourneyCreateInput,
  JourneyStatus,
  JourneyTemplateInput,
  JourneyUpdateInput,
  JourneysFilter,
  JourneysQueryOptions,
  JourneysReportType
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'
import { RevalidateJob } from '../../lib/prisma.types'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'
import { BlockService } from '../block/block.service'
import { PlausibleJob } from '../plausible/plausible.consumer'
import { QrCodeService } from '../qrCode/qrCode.service'

type BlockWithAction = Block & { action: BlockAction | null }

const FIVE_DAYS = 5 * 24 * 60 * 60 // in seconds

@Resolver('Journey')
export class JourneyResolver {
  constructor(
    @InjectQueue('api-journeys-revalidate')
    private readonly revalidateQueue: Queue<RevalidateJob>,
    @InjectQueue('api-journeys-plausible')
    private readonly plausibleQueue: Queue<PlausibleJob>,
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService,
    private readonly qrCodeService: QrCodeService
  ) {}

  @Query()
  async adminJourneysReport(
    @CurrentUserId() userId: string,
    @Args('reportType') reportType: JourneysReportType
  ): Promise<PowerBiEmbed> {
    let reportId: string | undefined
    switch (reportType) {
      case JourneysReportType.multipleFull:
        reportId = process.env.POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID
        break
      case JourneysReportType.multipleSummary:
        reportId = process.env.POWER_BI_JOURNEYS_MULTIPLE_SUMMARY_REPORT_ID
        break
      case JourneysReportType.singleFull:
        reportId = process.env.POWER_BI_JOURNEYS_SINGLE_FULL_REPORT_ID
        break
      case JourneysReportType.singleSummary:
        reportId = process.env.POWER_BI_JOURNEYS_SINGLE_SUMMARY_REPORT_ID
        break
    }

    if (
      process.env.POWER_BI_CLIENT_ID == null ||
      process.env.POWER_BI_CLIENT_SECRET == null ||
      process.env.POWER_BI_TENANT_ID == null ||
      process.env.POWER_BI_WORKSPACE_ID == null ||
      reportId == null
    ) {
      throw new GraphQLError('server environment variables missing', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      })
    }

    const config = {
      clientId: process.env.POWER_BI_CLIENT_ID,
      clientSecret: process.env.POWER_BI_CLIENT_SECRET,
      tenantId: process.env.POWER_BI_TENANT_ID,
      workspaceId: process.env.POWER_BI_WORKSPACE_ID
    }

    try {
      return await getPowerBiEmbed(config, reportId, userId)
    } catch (err) {
      if (err instanceof Error) {
        throw new GraphQLError(err.message, {
          extensions: { code: 'BAD_REQUEST' }
        })
      } else {
        throw new GraphQLError('An unexpected error occurred', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
      }
    }
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async adminJourneys(
    @CurrentUserId() userId: string,
    @CaslAccessible('Journey') accessibleJourneys: Prisma.JourneyWhereInput,
    @Args('status') status?: JourneyStatus[],
    @Args('template') template?: boolean,
    @Args('teamId') teamId?: string,
    @Args('useLastActiveTeamId') useLastActiveTeamId?: boolean
  ): Promise<Journey[]> {
    const filter: Prisma.JourneyWhereInput = {}
    if (useLastActiveTeamId === true) {
      const profile = await this.prismaService.journeyProfile.findUnique({
        where: { userId }
      })
      if (profile == null)
        throw new GraphQLError('journey profile not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      filter.teamId = profile.lastActiveTeamId ?? undefined
    }
    if (teamId != null) {
      filter.teamId = teamId
    } else if (template !== true && filter.teamId == null) {
      // if not looking for templates then only return journeys where:
      //   1. the user is an owner or editor
      //   2. not a member of the team
      filter.userJourneys = {
        some: {
          userId,
          role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
        }
      }
      filter.team = {
        userTeams: {
          none: {
            userId
          }
        }
      }
    }
    if (template != null) filter.template = template
    if (status != null) filter.status = { in: status }
    return await this.prismaService.journey.findMany({
      where: {
        AND: [accessibleJourneys, filter]
      }
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async adminJourney(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey> {
    const filter: Prisma.JourneyWhereUniqueInput =
      idType === IdType.slug ? { slug: id } : { id }
    const journey = await this.prismaService.journey.findUnique({
      where: filter,
      include: {
        userJourneys: true,
        team: {
          include: { userTeams: true }
        }
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Read, subject('Journey', journey)))
      throw new GraphQLError('user is not allowed to view journey', {
        extensions: { code: 'FORBIDDEN' }
      })
    return journey
  }

  @Query()
  async journeys(
    @Args('where') where?: JourneysFilter,
    @Args('options')
    options: JourneysQueryOptions = {
      hostname: null,
      embedded: false,
      journeyCollection: false
    }
  ): Promise<Journey[]> {
    if (options.embedded === true && options.hostname != null) return []

    const filter: Prisma.JourneyWhereInput = { status: JourneyStatus.published }
    if (where?.template != null) filter.template = where.template
    if (where?.featured != null)
      filter.featuredAt = where?.featured ? { not: null } : null
    if (where?.ids != null) filter.id = { in: where?.ids }
    let OR: Prisma.JourneyWhereInput[] = []
    if (where?.tagIds != null) {
      // find every journey which has a journeyTag matching at least 1 tagId
      OR = where.tagIds.map((tagId) => ({
        journeyTags: {
          some: {
            tagId
          }
        }
      }))
    }
    if (options.embedded !== true) {
      if (options.hostname != null) {
        if (options.journeyCollection !== true) {
          OR.push({
            team: {
              customDomains: {
                some: { name: options.hostname, routeAllTeamJourneys: true }
              }
            }
          })
        }
        OR.push({
          journeyCollectionJourneys: {
            some: {
              journeyCollection: {
                customDomains: { some: { name: options.hostname } }
              }
            }
          }
        })
      } else {
        filter.journeyCollectionJourneys = { none: {} }
        filter.team = {
          customDomains: { none: { routeAllTeamJourneys: true } }
        }
      }
    }
    if (where?.languageIds != null)
      filter.languageId = { in: where?.languageIds }

    if (OR.length > 0) filter.OR = OR

    return await this.prismaService.journey.findMany({
      where: filter,
      include:
        where?.tagIds != null
          ? {
              journeyTags: true
            }
          : undefined,
      take: where?.limit ?? undefined,
      orderBy:
        where?.orderByRecent === true ? { publishedAt: 'desc' } : undefined
    })
  }

  @Query()
  async journey(
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug,
    @Args('options')
    options: JourneysQueryOptions = {
      hostname: null,
      embedded: false
    }
  ): Promise<Journey | null> {
    if (options.embedded === true && options.hostname != null) return null

    const filter: Prisma.JourneyWhereUniqueInput =
      idType === IdType.slug ? { slug: id } : { id }
    if (options.embedded !== true) {
      if (options.hostname != null) {
        filter.team = {
          OR: [
            {
              customDomains: {
                some: { name: options.hostname, routeAllTeamJourneys: true }
              }
            },
            {
              journeyCollections: {
                some: {
                  customDomains: { some: { name: options.hostname } }
                }
              }
            }
          ]
        }
      } else {
        filter.team = {
          customDomains: { none: { routeAllTeamJourneys: true } }
        }
      }
    }
    const journey = await this.prismaService.journey.findUnique({
      where: filter
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    return journey
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCreate(
    @CaslAbility() ability: AppAbility,
    @Args('input') input: JourneyCreateInput,
    @CurrentUserId() userId: string,
    @Args('teamId') teamId: string
  ): Promise<Journey | undefined> {
    let retry = true
    let slug = slugify(input.slug ?? input.title, {
      lower: true,
      strict: true
    })
    const id = input.id ?? uuidv4()
    while (retry) {
      try {
        const journey = await this.prismaService.$transaction(async (tx) => {
          await tx.journey.create({
            data: {
              ...omit(input, ['id', 'primaryImageBlockId', 'teamId', 'hostId']),
              title: input.title,
              languageId: input.languageId,
              id,
              slug,
              status: JourneyStatus.published,
              publishedAt: new Date(),
              team: { connect: { id: teamId } },
              userJourneys: {
                create: {
                  userId,
                  role: UserJourneyRole.owner
                }
              }
            }
          })
          const journey = await tx.journey.findUnique({
            where: { id },
            include: {
              userJourneys: true,
              team: {
                include: { userTeams: true }
              }
            }
          })
          if (journey == null)
            throw new GraphQLError('journey not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          if (!ability.can(Action.Create, subject('Journey', journey)))
            throw new GraphQLError('user is not allowed to create journey', {
              extensions: { code: 'FORBIDDEN' }
            })
          return journey
        })
        retry = false
        await this.plausibleQueue.add(
          'create-journey-site',
          {
            __typename: 'plausibleCreateJourneySite',
            journeyId: journey.id
          },
          {
            removeOnComplete: true,
            removeOnFail: { age: FIVE_DAYS, count: 50 }
          }
        )
        await this.plausibleQueue.add(
          'create-team-site',
          {
            __typename: 'plausibleCreateTeamSite',
            teamId: journey.teamId
          },
          {
            removeOnComplete: true,
            removeOnFail: { age: FIVE_DAYS, count: 50 }
          }
        )
        return journey
      } catch (err) {
        if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
          slug = slugify(`${slug}-${id}`)
        } else {
          retry = false
          throw err
        }
      }
    }
  }

  getFirstMissingNumber(@Args('arr') arr: number[]): number {
    // May contain duplicate numbers in array so can't use binary search
    arr.sort((a, b) => a - b)
    let duplicateNumber = 0
    arr.forEach((num, i) => {
      if (arr[i] === duplicateNumber) duplicateNumber++
    })
    return duplicateNumber
  }

  getJourneyDuplicateNumbers(
    @Args('journeys') journeys: Journey[],
    @Args('title') title: string
  ): number[] {
    return journeys.map((journey) => {
      if (journey.title === title) {
        return 0
      } else if (journey.title === `${title} copy`) {
        return 1
      } else {
        // Find the difference between duplicated journey and journey in list
        // titles, remove the "copy" to find duplicate number
        const modifier = journey.title.split(title)[1]?.split(' copy')
        const duplicate = modifier[1]?.trim() ?? ''
        const numbers = duplicate.match(/^\d+$/)
        // If no duplicate number found, it's a unique journey. Return 0
        return numbers != null ? Number.parseInt(numbers[0]) : 0
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyDuplicate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @CurrentUserId() userId: string,
    @Args('teamId') teamId: string
  ): Promise<Journey | undefined> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id },
      include: {
        userJourneys: true,
        journeyTags: true,
        team: {
          include: { userTeams: true }
        },
        journeyCustomizationFields: true
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Read, subject('Journey', journey)))
      throw new GraphQLError('user is not allowed to duplicate journey', {
        extensions: { code: 'FORBIDDEN' }
      })

    const duplicateJourneyId = uuidv4()

    const originalBlocks = await this.prismaService.block.findMany({
      where: { journeyId: journey.id, typename: 'StepBlock', deletedAt: null },
      orderBy: { parentOrder: 'asc' },
      include: { action: true }
    })
    let duplicateMenuStepBlockId: string | undefined
    const duplicateStepIds = new Map<string, string>()
    originalBlocks.forEach((block) => {
      const duplicateBlockId = uuidv4()
      if (journey.menuStepBlockId === block.id) {
        duplicateMenuStepBlockId = duplicateBlockId
      }
      duplicateStepIds.set(block.id, duplicateBlockId)
    })
    const duplicateBlocks = await this.blockService.getDuplicateChildren(
      originalBlocks,
      id,
      null,
      true,
      duplicateStepIds,
      undefined,
      duplicateJourneyId,
      duplicateStepIds
    )

    let duplicatePrimaryImageBlock: BlockWithAction | undefined
    if (journey.primaryImageBlockId != null) {
      const primaryImageBlock = await this.prismaService.block.findUnique({
        where: { id: journey.primaryImageBlockId },
        include: { action: true }
      })
      if (primaryImageBlock != null) {
        const id = uuidv4()
        duplicatePrimaryImageBlock = {
          ...omit(primaryImageBlock, ['id']),
          id
        }

        duplicateBlocks.push(duplicatePrimaryImageBlock)
      }
    }

    let duplicateLogoImageBlock: BlockWithAction | undefined
    if (journey.logoImageBlockId != null) {
      const logoImageBlock = await this.prismaService.block.findUnique({
        where: { id: journey.logoImageBlockId },
        include: { action: true }
      })
      if (logoImageBlock != null) {
        const id = uuidv4()
        duplicateLogoImageBlock = {
          ...omit(logoImageBlock, ['id']),
          id
        }

        duplicateBlocks.push(duplicateLogoImageBlock)
      }
    }

    const existingActiveDuplicateJourneys =
      await this.prismaService.journey.findMany({
        where: {
          title: {
            contains: journey.title
          },
          archivedAt: null,
          trashedAt: null,
          deletedAt: null,
          template: false,
          team: { id: teamId }
        }
      })
    const duplicates = this.getJourneyDuplicateNumbers(
      existingActiveDuplicateJourneys,
      journey.title
    )
    const duplicateNumber = this.getFirstMissingNumber(duplicates)
    const duplicateTitle = `${journey.title}${
      duplicateNumber === 0
        ? ''
        : duplicateNumber === 1
          ? ' copy'
          : ` copy ${duplicateNumber}`
    }`.trimEnd()

    let slug = slugify(duplicateTitle, {
      lower: true,
      strict: true
    })

    const duplicateCustomizationFields = journey.journeyCustomizationFields.map(
      (field) => ({
        ...field,
        id: uuidv4(),
        journeyId: duplicateJourneyId
      })
    )

    let retry = true
    while (retry) {
      try {
        const duplicateJourney = await this.prismaService.$transaction(
          async (tx) => {
            await tx.journey.create({
              data: {
                ...omit(journey, [
                  'primaryImageBlockId',
                  'creatorImageBlockId',
                  'creatorDescription',
                  'publishedAt',
                  'hostId',
                  'teamId',
                  'createdAt',
                  'strategySlug',
                  'journeyTags',
                  'logoImageBlockId',
                  'menuStepBlockId',
                  'journeyCustomizationFields'
                ]),
                id: duplicateJourneyId,
                slug,
                title: duplicateTitle,
                status: JourneyStatus.published,
                publishedAt: new Date(),
                featuredAt: null,
                template: false,
                fromTemplateId: journey.template
                  ? id
                  : (journey.fromTemplateId ?? null),
                team: { connect: { id: teamId } },
                userJourneys: {
                  create: {
                    userId,
                    role: UserJourneyRole.owner
                  }
                }
              }
            })

            await tx.journeyCustomizationField.createMany({
              data: duplicateCustomizationFields
            })

            const duplicateJourney = await tx.journey.findUnique({
              where: { id: duplicateJourneyId },
              include: {
                userJourneys: true,
                team: {
                  include: { userTeams: true }
                }
              }
            })
            if (duplicateJourney == null)
              throw new GraphQLError('journey not found', {
                extensions: { code: 'NOT_FOUND' }
              })
            if (
              !ability.can(Action.Create, subject('Journey', duplicateJourney))
            )
              throw new GraphQLError(
                'user is not allowed to duplicate journey',
                {
                  extensions: { code: 'FORBIDDEN' }
                }
              )
            return duplicateJourney
          }
        )

        // save base blocks
        await this.blockService.saveAll(
          duplicateBlocks.map((block) => ({
            // if updating the omit, also do the same in block.service.ts saveAll
            ...omit(block, [
              'journeyId',
              'parentBlockId',
              'posterBlockId',
              'coverBlockId',
              'pollOptionImageBlockId',
              'nextBlockId',
              'action'
            ]),
            typename: block.typename,
            journey: {
              connect: { id: duplicateJourneyId }
            },
            settings: block.settings ?? {}
          }))
        )
        // update block references after import
        // if updating references, also do the same in block.service.ts saveAll
        for (const block of duplicateBlocks) {
          if (
            block.parentBlockId != null ||
            block.posterBlockId != null ||
            block.coverBlockId != null ||
            block.nextBlockId != null ||
            block.pollOptionImageBlockId != null
          ) {
            await this.prismaService.block.update({
              where: { id: block.id },
              data: {
                parentBlockId: block.parentBlockId ?? undefined,
                posterBlockId: block.posterBlockId ?? undefined,
                coverBlockId: block.coverBlockId ?? undefined,
                nextBlockId: block.nextBlockId ?? undefined,
                pollOptionImageBlockId:
                  block.pollOptionImageBlockId ?? undefined
              }
            })
          }
          if (block.action != null && !isEmpty(block.action)) {
            await this.prismaService.action.create({
              data: {
                ...block.action,
                customizable: false,
                parentStepId: null,
                parentBlockId: block.id
              }
            })
          }
        }

        if (duplicatePrimaryImageBlock != null) {
          await this.prismaService.journey.update({
            where: { id: duplicateJourneyId },
            data: { primaryImageBlockId: duplicatePrimaryImageBlock.id }
          })
        }
        if (duplicateLogoImageBlock != null) {
          await this.prismaService.journey.update({
            where: { id: duplicateJourneyId },
            data: { logoImageBlockId: duplicateLogoImageBlock.id }
          })
        }
        if (duplicateMenuStepBlockId != null) {
          await this.prismaService.journey.update({
            where: { id: duplicateJourneyId },
            data: { menuStepBlockId: duplicateMenuStepBlockId }
          })
        }
        retry = false
        await this.plausibleQueue.add(
          'create-journey-site',
          {
            __typename: 'plausibleCreateJourneySite',
            journeyId: duplicateJourneyId
          },
          {
            removeOnComplete: true,
            removeOnFail: { age: FIVE_DAYS, count: 50 }
          }
        )
        await this.plausibleQueue.add(
          'create-team-site',
          {
            __typename: 'plausibleCreateTeamSite',
            teamId
          },
          {
            removeOnComplete: true,
            removeOnFail: { age: FIVE_DAYS, count: 50 }
          }
        )
        return duplicateJourney
      } catch (err) {
        if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
          slug = slugify(`${slug}-${duplicateJourneyId}`)
        } else {
          retry = false
          throw err
        }
      }
    }
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: JourneyUpdateInput
  ): Promise<Journey> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id },
      include: {
        userJourneys: true,
        team: {
          include: { userTeams: true }
        }
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Update, subject('Journey', journey)))
      throw new GraphQLError('user is not allowed to update journey', {
        extensions: { code: 'FORBIDDEN' }
      })
    if (input.slug != null)
      input.slug = slugify(input.slug, {
        lower: true,
        strict: true
      })
    if (input.hostId != null) {
      const host = await this.prismaService.host.findUnique({
        where: { id: input.hostId }
      })
      if (host == null)
        throw new GraphQLError('host not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (host.teamId !== journey.teamId)
        throw new GraphQLError(
          'the team id of host does not match team id of journey',
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        )
    }
    try {
      return await this.prismaService.$transaction(async (tx) => {
        // Delete all tags and create with new input tags
        if (input.tagIds != null) {
          await tx.journeyTag.deleteMany({
            where: {
              journeyId: journey.id
            }
          })
        }

        const updatedJourney = await tx.journey.update({
          where: { id },
          include: {
            team: {
              include: {
                customDomains: true
              }
            }
          },
          data: {
            ...omit(input, ['tagIds']),
            title: input.title ?? undefined,
            languageId: input.languageId ?? undefined,
            slug: input.slug ?? undefined,
            journeyTags:
              input.tagIds != null
                ? { create: input.tagIds.map((tagId) => ({ tagId })) }
                : undefined
          }
        })

        if (input.slug != null) {
          await this.qrCodeService.updateJourneyShortLink(
            updatedJourney.id,
            input.slug
          )
        }

        if (
          input.seoTitle != null ||
          input.seoDescription != null ||
          input.primaryImageBlockId != null
        ) {
          await this.revalidateQueue.add('revalidate', {
            slug: updatedJourney.slug,
            hostname: updatedJourney.team.customDomains[0]?.name,
            fbReScrape: true
          })
        }

        return updatedJourney
      })
    } catch (err) {
      if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED)
        throw new GraphQLError('slug is not unique', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      throw err
    }
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyPublish(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Journey> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id },
      include: {
        userJourneys: true,
        team: {
          include: { userTeams: true }
        }
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Manage, subject('Journey', journey)))
      throw new GraphQLError('user is not allowed to publish journey', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.journey.update({
      where: { id },
      data: {
        status: JourneyStatus.published,
        publishedAt: new Date()
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyFeature(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('feature') feature: boolean
  ): Promise<Journey> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id },
      include: {
        userJourneys: true,
        team: {
          include: { userTeams: true }
        }
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Manage, subject('Journey', journey), 'template'))
      throw new GraphQLError('user is not allowed to update featured date', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.journey.update({
      where: { id },
      data: {
        featuredAt: feature ? new Date() : null
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeysArchive(
    @CaslAccessible(['Journey', Action.Manage])
    accessibleJourneys: Prisma.JourneyWhereInput,
    @Args('ids') ids: string[]
  ): Promise<Journey[]> {
    await this.prismaService.journey.updateMany({
      where: { AND: [accessibleJourneys, { id: { in: ids } }] },
      data: { status: JourneyStatus.archived, archivedAt: new Date() }
    })
    return await this.prismaService.journey.findMany({
      where: { AND: [accessibleJourneys, { id: { in: ids } }] }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeysDelete(
    @CaslAccessible(['Journey', Action.Manage])
    accessibleJourneys: Prisma.JourneyWhereInput,
    @Args('ids') ids: string[]
  ): Promise<Journey[]> {
    await this.prismaService.journey.updateMany({
      where: { AND: [accessibleJourneys, { id: { in: ids } }] },
      data: { status: JourneyStatus.deleted, deletedAt: new Date() }
    })
    return await this.prismaService.journey.findMany({
      where: { AND: [accessibleJourneys, { id: { in: ids } }] }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeysTrash(
    @CaslAccessible(['Journey', Action.Manage])
    accessibleJourneys: Prisma.JourneyWhereInput,
    @Args('ids') ids: string[]
  ): Promise<Journey[]> {
    await this.prismaService.journey.updateMany({
      where: { AND: [accessibleJourneys, { id: { in: ids } }] },
      data: { status: JourneyStatus.trashed, trashedAt: new Date() }
    })
    return await this.prismaService.journey.findMany({
      where: { AND: [accessibleJourneys, { id: { in: ids } }] }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeysRestore(
    @CaslAccessible(['Journey', Action.Manage])
    accessibleJourneys: Prisma.JourneyWhereInput,
    @Args('ids') ids: string[]
  ): Promise<Journey[]> {
    const results = await this.prismaService.journey.findMany({
      where: { AND: [accessibleJourneys, { id: { in: ids } }] }
    })
    return await Promise.all(
      results.map(
        async (journey) =>
          await this.prismaService.journey.update({
            where: { id: journey.id },
            data: {
              status: JourneyStatus.published,
              publishedAt: new Date()
            }
          })
      )
    )
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyTemplate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: JourneyTemplateInput
  ): Promise<Journey> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id },
      include: {
        userJourneys: true,
        team: {
          include: { userTeams: true }
        }
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Manage, subject('Journey', journey), 'template'))
      throw new GraphQLError(
        'user is not allowed to change journey to or from a template',
        {
          extensions: { code: 'FORBIDDEN' }
        }
      )
    return await this.prismaService.journey.update({
      where: { id },
      data: input
    })
  }

  @ResolveField()
  @FromPostgresql()
  async blocks(@Parent() journey: Journey): Promise<Block[]> {
    const filter: Prisma.BlockWhereInput = {
      journeyId: journey.id,
      deletedAt: null
    }
    const idNotIn: string[] = []
    if (journey.primaryImageBlockId != null) {
      idNotIn.push(journey.primaryImageBlockId)
    }
    if (journey.creatorImageBlockId != null) {
      idNotIn.push(journey.creatorImageBlockId)
    }
    if (journey.logoImageBlockId != null) {
      idNotIn.push(journey.logoImageBlockId)
    }
    if (idNotIn.length > 0) {
      filter.id = { notIn: idNotIn }
    }
    const res = await this.prismaService.block.findMany({
      where: filter,
      orderBy: { parentOrder: 'asc' },
      include: { action: true }
    })

    return await this.blockService.removeDescendantsOfDeletedBlocks(res)
  }

  @ResolveField()
  async chatButtons(@Parent() journey: Journey): Promise<ChatButton[]> {
    return await this.prismaService.chatButton.findMany({
      where: { journeyId: journey.id }
    })
  }

  @ResolveField()
  async host(@Parent() journey: Journey): Promise<Host | null> {
    if (journey.hostId == null) return null
    return await this.prismaService.host.findUnique({
      where: { id: journey.hostId }
    })
  }

  @ResolveField()
  async team(@Parent() journey: Journey): Promise<Team | null> {
    if (journey.teamId == null) return null
    return await this.prismaService.team.findUnique({
      where: { id: journey.teamId }
    })
  }

  @ResolveField()
  async primaryImageBlock(@Parent() journey: Journey): Promise<Block | null> {
    if (journey.primaryImageBlockId == null) return null
    const block = await this.prismaService.block.findUnique({
      where: { id: journey.primaryImageBlockId },
      include: { action: true }
    })
    if (block?.journeyId !== journey.id) return null
    return block
  }

  @ResolveField()
  async creatorImageBlock(@Parent() journey: Journey): Promise<Block | null> {
    if (journey.creatorImageBlockId == null) return null
    const block = await this.prismaService.block.findUnique({
      where: { id: journey.creatorImageBlockId },
      include: { action: true }
    })
    if (block?.journeyId !== journey.id) return null
    return block
  }

  @ResolveField()
  async logoImageBlock(@Parent() journey: Journey): Promise<Block | null> {
    if (journey.logoImageBlockId == null) return null
    const block = await this.prismaService.block.findUnique({
      where: { id: journey.logoImageBlockId },
      include: { action: true }
    })
    if (block?.journeyId !== journey.id) return null
    return block
  }

  @ResolveField()
  async menuStepBlock(@Parent() journey: Journey): Promise<Block | null> {
    if (journey.menuStepBlockId == null) return null
    const block = await this.prismaService.block.findUnique({
      where: { id: journey.menuStepBlockId },
      include: { action: true }
    })
    if (block?.journeyId !== journey.id) return null
    return block
  }

  @ResolveField()
  async userJourneys(
    @Parent() journey: Journey,
    @CaslAbility({ optional: true }) ability?: AppAbility
  ): Promise<UserJourney[]> {
    if (ability == null) return []
    const userJourneys = await this.prismaService.journey
      .findUnique({
        where: { id: journey.id }
      })
      .userJourneys({
        include: {
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })
    return filter(userJourneys, (userJourney) =>
      ability.can(Action.Read, subject('UserJourney', userJourney))
    )
  }

  @ResolveField('plausibleToken')
  @UseGuards(AppCaslGuard)
  async plausibleToken(
    @CaslAbility() ability: AppAbility,
    @Parent() journey: Journey
  ): Promise<string | null> {
    if (ability.cannot(Action.Update, subject('Journey', journey))) return null

    return journey.plausibleToken
  }

  @ResolveField('language')
  async language(
    @Parent() journey: Journey
  ): Promise<{ __typename: 'Language'; id: string }> {
    return { __typename: 'Language', id: journey.languageId }
  }

  @ResolveField('tags')
  async tags(
    @Parent() journey: Journey
  ): Promise<Array<{ __typename: 'Tag'; id: string }>> {
    const journeyTags =
      (await this.prismaService.journey
        .findUnique({
          where: { id: journey.id }
        })
        .journeyTags()) ?? []

    return journeyTags.map((tag) => {
      return { __typename: 'Tag', id: tag.tagId }
    })
  }

  @ResolveField()
  async journeyCollections(
    @Parent() parent: Journey
  ): Promise<JourneyCollection[]> {
    return await this.prismaService.journeyCollection.findMany({
      where: {
        journeyCollectionJourneys: { some: { journeyId: parent.id } }
      }
    })
  }

  @ResolveField()
  async journeyTheme(@Parent() journey: Journey): Promise<JourneyTheme | null> {
    return await this.prismaService.journeyTheme.findUnique({
      where: { journeyId: journey.id }
    })
  }

  @ResolveField('journeyCustomizationFields')
  async journeyCustomizationFields(
    @Parent() journey: Journey
  ): Promise<JourneyCustomizationField[]> {
    return await this.prismaService.journeyCustomizationField.findMany({
      where: { journeyId: journey.id }
    })
  }
}
