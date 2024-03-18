import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'
import omit from 'lodash/omit'

import { CustomDomain } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  CustomDomainCreateInput,
  CustomDomainUpdateInput,
  CustomDomainVerification
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { CustomDomainService } from './customDomain.service'

@Resolver('CustomDomain')
export class CustomDomainResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly customDomainService: CustomDomainService
  ) {}

  @Query()
  async customDomain(@Args('id') id: string): Promise<CustomDomain | null> {
    return await this.prismaService.customDomain.findUnique({
      where: { id }
    })
  }

  @Query()
  async customDomains(@Args('teamId') teamId: string): Promise<CustomDomain[]> {
    return await this.prismaService.customDomain.findMany({
      where: { teamId }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainCreate(
    @Args('input') input: CustomDomainCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<CustomDomain & { verification: CustomDomainVerification }> {
    return await this.customDomainService.customDomainCreate(input, ability)
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainUpdate(
    @Args('input') input: CustomDomainUpdateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<CustomDomainUpdateInput> {
    const customDomain = await this.prismaService.customDomain.findUnique({
      where: { id: input.id },
      include: { team: { include: { userTeams: true } } }
    })
    if (customDomain == null) {
      throw new Error('Custom domain not found')
    }
    if (!ability.can(Action.Manage, subject('CustomDomain', customDomain))) {
      throw new Error('user is not allowed to update custom domain')
    }
    return await this.prismaService.customDomain.update({
      where: { id: input.id },
      data: {
        ...omit(input, 'journeyCollectionId'),
        name: input.name ?? undefined,
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
    if (customDomain == null) {
      throw new Error('Custom domain not found')
    }
    if (!ability.can(Action.Delete, subject('CustomDomain', customDomain))) {
      throw new Error('user is not allowed to delete custom domain')
    }
    await this.prismaService.customDomain.delete({
      where: { id }
    })
    await this.customDomainService.deleteVercelDomain(customDomain.name)
    return customDomain
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'CustomDomain'
    id: string
  }): Promise<CustomDomain | null> {
    return await this.customDomain(reference.id)
  }

  @ResolveField()
  journeyCollection(
    @Parent() customDomain: CustomDomain
  ): null | { __typename: 'JourneyCollection'; id: string } {
    return customDomain.journeyCollectionId == null
      ? null
      : {
          __typename: 'JourneyCollection',
          id: customDomain.journeyCollectionId
        }
  }

  @ResolveField()
  async verification(
    @Parent() customDomain: CustomDomain
  ): Promise<CustomDomainVerification> {
    const vercelResult = await this.customDomainService.verifyVercelDomain(
      customDomain.name
    )
    return {
      verified: vercelResult.verified,
      verification: vercelResult.verification
    }
  }
}
