import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import {
  CustomDomain,
  Journey,
  JourneyCollection,
  Prisma,
  Team
} from '@core/prisma/journeys/client'

import {
  CustomDomainCheck,
  CustomDomainCreateInput,
  CustomDomainUpdateInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'
import { QrCodeService } from '../qrCode/qrCode.service'

import { CustomDomainService } from './customDomain.service'

@Resolver('CustomDomain')
export class CustomDomainResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly customDomainService: CustomDomainService,
    private readonly qrCodeService: QrCodeService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async customDomain(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<CustomDomain> {
    const customDomain = await this.prismaService.customDomain.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            userTeams: true,
            journeys: { include: { userJourneys: true } }
          }
        }
      }
    })
    if (customDomain == null)
      throw new GraphQLError('custom domain not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Read, subject('CustomDomain', customDomain)))
      throw new GraphQLError('user is not allowed to read custom domain', {
        extensions: { code: 'FORBIDDEN' }
      })
    return customDomain
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async customDomains(
    @Args('teamId') teamId: string,
    @CaslAccessible('CustomDomain')
    accessibleCustomDomains: Prisma.CustomDomainWhereInput
  ): Promise<CustomDomain[]> {
    return await this.prismaService.customDomain.findMany({
      where: { AND: [accessibleCustomDomains, { teamId }] }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainCreate(
    @Args('input') input: CustomDomainCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<CustomDomain> {
    if (!this.customDomainService.isDomainValid(input.name))
      throw new GraphQLError('custom domain has invalid domain name', {
        extensions: { code: 'BAD_USER_INPUT' }
      })

    try {
      return await this.prismaService.$transaction(async (tx) => {
        const { apexName } = await this.customDomainService.createVercelDomain(
          input.name
        )
        const data: Prisma.CustomDomainCreateInput = {
          ...omit(input, ['teamId', 'journeyCollectionId']),
          id: input.id ?? undefined,
          apexName,
          team: { connect: { id: input.teamId } },
          routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined
        }
        if (input.journeyCollectionId != null) {
          data.journeyCollection = {
            connect: { id: input.journeyCollectionId }
          }
        }
        const customDomain = await tx.customDomain.create({
          data,
          include: { team: { include: { userTeams: true } } }
        })
        if (
          !ability.can(Action.Create, subject('CustomDomain', customDomain))
        ) {
          await this.customDomainService.deleteVercelDomain(customDomain)
          throw new GraphQLError(
            'user is not allowed to create custom domain',
            {
              extensions: { code: 'FORBIDDEN' }
            }
          )
        }

        await this.qrCodeService.updateTeamShortLinks(
          customDomain.teamId,
          customDomain.name
        )

        return customDomain
      })
    } catch (err) {
      if (err.code === ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED) {
        throw new GraphQLError('custom domain already exists', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }
      throw err
    }
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainUpdate(
    @Args('id') id: string,
    @Args('input') input: CustomDomainUpdateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<CustomDomainUpdateInput> {
    const customDomain = await this.prismaService.customDomain.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (customDomain == null)
      throw new GraphQLError('custom domain not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('CustomDomain', customDomain)))
      throw new GraphQLError('user is not allowed to update custom domain', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.prismaService.customDomain.update({
      where: { id },
      data: {
        routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined,
        journeyCollection: {
          connect: { id: input.journeyCollectionId ?? undefined }
        }
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainDelete(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<CustomDomain> {
    const customDomain = await this.prismaService.customDomain.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (customDomain == null)
      throw new GraphQLError('custom domain not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Delete, subject('CustomDomain', customDomain)))
      throw new GraphQLError('user is not allowed to delete custom domain', {
        extensions: { code: 'FORBIDDEN' }
      })

    await this.prismaService.$transaction(async (tx) => {
      await this.qrCodeService.updateTeamShortLinks(
        customDomain.teamId,
        customDomain.name
      )

      await tx.customDomain.delete({
        where: { id }
      })
      await this.customDomainService.deleteVercelDomain(customDomain)
    })
    return customDomain
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainCheck(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<CustomDomainCheck> {
    const customDomain = await this.prismaService.customDomain.findUnique({
      where: { id },
      include: { team: { include: { userTeams: true } } }
    })
    if (customDomain == null)
      throw new GraphQLError('custom domain not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Manage, subject('CustomDomain', customDomain)))
      throw new GraphQLError('user is not allowed to check custom domain', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.customDomainService.checkVercelDomain(customDomain)
  }

  @ResolveField()
  async journeyCollection(
    @Parent() customDomain: CustomDomain
  ): Promise<null | (JourneyCollection & { journeys: Journey[] })> {
    if (customDomain.journeyCollectionId == null) return null

    const result = await this.prismaService.journeyCollection.findFirst({
      where: {
        customDomains: { some: { id: customDomain.id } }
      },
      include: {
        journeyCollectionJourneys: {
          include: { journey: true },
          orderBy: { order: 'asc' }
        },
        team: true
      }
    })

    if (result == null) return null

    return {
      ...omit(result, 'journeyCollectionJourneys'),
      journeys: result.journeyCollectionJourneys.map(({ journey }) => journey)
    }
  }

  @ResolveField()
  async team(@Parent() customDomain: CustomDomain): Promise<Team | null> {
    return await this.prismaService.team.findUnique({
      where: { id: customDomain.teamId }
    })
  }
}
