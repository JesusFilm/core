import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { CurrentUserId } from '@core/nest/decorators/CurrentUserId'
import slugify from 'slugify'
import { UseGuards } from '@nestjs/common'
import {
  getPowerBiEmbed,
  PowerBiEmbed
} from '@core/nest/powerBi/getPowerBiEmbed'
import {
  ApolloError,
  ForbiddenError,
  UserInputError
} from 'apollo-server-errors'
import { GqlAuthGuard } from '@core/nest/gqlAuthGuard/GqlAuthGuard'
import { v4 as uuidv4 } from 'uuid'
import { UserTeamRole } from '.prisma/api-journeys-client'
import { BlockService } from '../block/block.service'
import {
  Block,
  IdType,
  ImageBlock,
  Journey,
  JourneyCreateInput,
  JourneyStatus,
  JourneyUpdateInput,
  ThemeMode,
  ThemeName,
  UserJourney,
  UserJourneyRole,
  JourneysFilter,
  JourneyTemplateInput,
  JourneysReportType,
  Role
} from '../../__generated__/graphql'
import { UserJourneyService } from '../userJourney/userJourney.service'
import { RoleGuard } from '../../lib/roleGuard/roleGuard'
import { UserRoleService } from '../userRole/userRole.service'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from './journey.service'

const ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED = 1210

@Resolver('Journey')
export class JourneyResolver {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly blockService: BlockService,
    private readonly userJourneyService: UserJourneyService,
    private readonly userRoleService: UserRoleService,
    private readonly prismaService: PrismaService
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
      throw new ApolloError('server environment variables missing')
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
      throw new ApolloError(err.message)
    }
  }

  @Query()
  async adminJourneys(
    @CurrentUserId() userId: string,
    @Args('status') status: JourneyStatus[],
    @Args('template') template?: boolean
  ): Promise<Journey[]> {
    const user = await this.userRoleService.getUserRoleById(userId)
    return await this.journeyService.getAllByRole(user, status, template)
  }

  @Query()
  async adminJourney(
    @CurrentUserId() userId: string,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey | null> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(id)
        : await this.journeyService.get(id)
    if (result == null) return null
    if (result.template !== true) {
      const ujResult = await this.userJourneyService.forJourneyUser(
        result.id,
        userId
      )
      if (ujResult == null)
        throw new ForbiddenError(
          'User has not received an invitation to edit this journey.'
        )
      if (ujResult.role === UserJourneyRole.inviteRequested)
        throw new ForbiddenError('User invitation pending.')
    } else {
      if (result.status !== JourneyStatus.published) {
        const urResult = await this.userRoleService.getUserRoleById(userId)
        const isPublisher = urResult.roles?.includes(Role.publisher)
        if (isPublisher !== true)
          throw new ForbiddenError(
            'You do not have access to unpublished templates'
          )
      }
    }

    return result
  }

  @Query()
  async journeys(@Args('where') where?: JourneysFilter): Promise<Journey[]> {
    return await this.journeyService.getAllPublishedJourneys(where)
  }

  @Query()
  async journey(
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<Journey | null> {
    const result: Journey =
      idType === IdType.slug
        ? await this.journeyService.getBySlug(id)
        : await this.journeyService.get(id)
    return result
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async journeyCreate(
    @Args('input') input: JourneyCreateInput & { id?: string },
    @CurrentUserId() userId: string
  ): Promise<Journey | undefined> {
    input.id = input.id ?? uuidv4()
    input.slug = slugify(input.slug ?? input.title, {
      lower: true,
      strict: true
    })
    let retry = true
    while (retry) {
      try {
        // this should be removed when the UI can support team management
        const team = { id: 'jfp-team' }
        const journey: Journey = await this.journeyService.save({
          themeName: ThemeName.base,
          themeMode: ThemeMode.light,
          createdAt: new Date().toISOString(),
          status: JourneyStatus.draft,
          teamId: team.id,
          ...input
        })
        await this.userJourneyService.save(
          {
            id: uuidv4(),
            userId,
            journeyId: journey.id,
            role: UserJourneyRole.owner
          },
          {
            returnNew: false
          }
        )
        await this.prismaService.userTeam.upsert({
          where: {
            teamId_userId: {
              userId,
              teamId: team.id
            }
          },
          update: {},
          create: {
            userId,
            teamId: team.id,
            role: UserTeamRole.guest
          }
        })

        retry = false
        return journey
      } catch (err) {
        if (err.errorNum === ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED) {
          input.slug = slugify(`${input.slug}-${input.id}`)
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
    return journeys.map((journey, i) => {
      if (journey.title === title) {
        return 0
      } else if (journey.title === `${title} copy`) {
        return 1
      } else {
        // Find the difference between duplicated journey and journey in list titles, remove the "copy" to find duplicate number
        const modifier = journey.title.split(title)[1]?.split(' copy')
        const duplicate = modifier[1]?.trim() ?? ''
        const numbers = duplicate.match(/^\d+$/)
        // If no duplicate number found, it's a unique journey. Return 0
        return numbers != null ? parseInt(numbers[0]) : 0
      }
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('id', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      {
        role: 'public',
        attributes: { template: true, status: JourneyStatus.published }
      }
    ])
  )
  async journeyDuplicate(
    @Args('id') id: string,
    @CurrentUserId() userId: string
  ): Promise<
    (Journey & { primaryImageBlockId: string | undefined }) | undefined
  > {
    const journey: Journey & { primaryImageBlockId: string | undefined } =
      await this.journeyService.get(id)
    const duplicateJourneyId = uuidv4()
    const existingDuplicateJourneys = await this.journeyService.getAllByTitle(
      journey.title,
      userId
    )
    const duplicates = this.getJourneyDuplicateNumbers(
      existingDuplicateJourneys,
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

    const slug = slugify(duplicateTitle, {
      lower: true,
      strict: true
    })

    const originalBlocks = await this.blockService.getBlocksByType(
      journey,
      'StepBlock'
    )
    const duplicateStepIds = new Map()
    originalBlocks.forEach((block) => {
      duplicateStepIds.set(block.id, uuidv4())
    })
    const duplicateBlocks = await this.blockService.getDuplicateChildren(
      originalBlocks,
      id,
      null,
      duplicateStepIds,
      duplicateJourneyId,
      duplicateStepIds
    )

    let duplicatePrimaryImageBlock: (ImageBlock & { _key: string }) | undefined
    if (journey.primaryImageBlockId != null) {
      const original = await this.blockService.get(journey.primaryImageBlockId)
      const id = uuidv4()
      duplicatePrimaryImageBlock = {
        ...original,
        _key: id,
        journeyId: duplicateJourneyId,
        parentBlockId: duplicateJourneyId
      }
      duplicatePrimaryImageBlock != null &&
        duplicateBlocks.push(duplicatePrimaryImageBlock)
    }

    const input = {
      ...journey,
      id: duplicateJourneyId,
      slug,
      title: duplicateTitle,
      createdAt: new Date().toISOString(),
      publishedAt: undefined,
      status: JourneyStatus.draft,
      template: false,
      primaryImageBlockId: duplicatePrimaryImageBlock?._key
    }

    let retry = true
    while (retry) {
      try {
        const journey: Journey & { primaryImageBlockId: string | undefined } =
          await this.journeyService.save(input)
        await this.blockService.saveAll(duplicateBlocks)
        await this.userJourneyService.save({
          id: uuidv4(),
          userId,
          journeyId: journey.id,
          role: UserJourneyRole.owner
        })
        retry = false
        return journey
      } catch (err) {
        if (err.errorNum === ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED) {
          input.slug = slugify(`${input.slug}-${input.id}`)
        } else {
          retry = false
          throw err
        }
      }
    }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('id', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async journeyUpdate(
    @Args('id') id: string,
    @Args('input') input: JourneyUpdateInput
  ): Promise<Journey> {
    if (input.slug != null)
      input.slug = slugify(input.slug, {
        lower: true,
        strict: true
      })
    try {
      return await this.journeyService.update(id, input)
    } catch (err) {
      if (err.errorNum === ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED) {
        throw new UserInputError('Slug is not unique')
      } else {
        throw err
      }
    }
  }

  @Mutation()
  @UseGuards(
    RoleGuard('id', [
      UserJourneyRole.owner,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async journeyPublish(@Args('id') id: string): Promise<Journey> {
    return await this.journeyService.update(id, {
      status: JourneyStatus.published,
      publishedAt: new Date().toISOString()
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('ids', [
      UserJourneyRole.owner,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async journeysArchive(@Args('ids') ids: string[]): Promise<Journey[]> {
    const results = (await this.journeyService.getAllByIds(ids)).map(
      (journey) => ({
        _key: journey.id,
        status: JourneyStatus.archived,
        archivedAt: new Date().toISOString()
      })
    )

    return (await this.journeyService.updateAll(
      results
    )) as unknown as Journey[]
  }

  @Mutation()
  @UseGuards(
    RoleGuard('ids', [
      UserJourneyRole.owner,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async journeysDelete(@Args('ids') ids: string[]): Promise<Journey[]> {
    const results = (await this.journeyService.getAllByIds(ids)).map(
      (journey) => ({
        _key: journey.id,
        status: JourneyStatus.deleted,
        deletedAt: new Date().toISOString()
      })
    )
    return (await this.journeyService.updateAll(
      results
    )) as unknown as Journey[]
  }

  @Mutation()
  @UseGuards(
    RoleGuard('ids', [
      UserJourneyRole.owner,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async journeysTrash(@Args('ids') ids: string[]): Promise<Journey[]> {
    const results = (await this.journeyService.getAllByIds(ids)).map(
      (journey) => ({
        _key: journey.id,
        status: JourneyStatus.trashed,
        trashedAt: new Date().toISOString()
      })
    )

    return (await this.journeyService.updateAll(
      results
    )) as unknown as Journey[]
  }

  @Mutation()
  @UseGuards(
    RoleGuard('ids', [
      UserJourneyRole.owner,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async journeysRestore(@Args('ids') ids: string[]): Promise<Journey[]> {
    const results = (await this.journeyService.getAllByIds(ids)).map(
      (journey) => ({
        _key: journey.id,
        status:
          journey.publishedAt == null
            ? JourneyStatus.draft
            : JourneyStatus.published
      })
    )

    return (await this.journeyService.updateAll(
      results
    )) as unknown as Journey[]
  }

  @Mutation()
  @UseGuards(RoleGuard('id', { role: Role.publisher }))
  async journeyTemplate(
    @Args('id') id: string,
    @Args('input') input: JourneyTemplateInput
  ): Promise<Journey> {
    return await this.journeyService.update(id, input)
  }

  @ResolveField()
  async blocks(@Parent() journey: Journey): Promise<Block[]> {
    return await this.blockService.forJourney(journey)
  }

  @ResolveField()
  async primaryImageBlock(
    @Parent() journey: Journey & { primaryImageBlockId?: string | null }
  ): Promise<ImageBlock | null> {
    if (journey.primaryImageBlockId == null) return null
    const block: ImageBlock = await this.blockService.get(
      journey.primaryImageBlockId
    )
    if (block.journeyId !== journey.id) return null
    return block
  }

  @ResolveField()
  async userJourneys(@Parent() journey: Journey): Promise<UserJourney[]> {
    return await this.userJourneyService.forJourney(journey)
  }

  @ResolveField('language')
  async language(
    @Parent() journey
  ): Promise<{ __typename: 'Language'; id: string }> {
    // 529 (english) is default if not set
    return { __typename: 'Language', id: journey.languageId ?? '529' }
  }
}
