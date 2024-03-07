import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Query,
  ResolveReference,
  Resolver
} from '@nestjs/graphql'
import omit from 'lodash/omit'

import {
  CustomDomain,
  CustomDomainCreateInput
} from '../../__generated__/graphql'
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
  @UseGuards(AppCaslGuard)
  async customDomain(@Args('id') id: string): Promise<CustomDomain | null> {
    return await this.findDomain(id)
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async customDomains(@Args('teamId') teamId: string): Promise<CustomDomain[]> {
    return (
      ((await this.prismaService.customDomain.findMany({
        where: { teamId }
      })) as unknown as CustomDomain[]) ?? []
    )
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainCreate(
    @Args('input') input: CustomDomainCreateInput
  ): Promise<CustomDomain> {
    const vercelResult = await this.customDomainService.addVercelDomain(
      input.name
    )
    const customDomain = await this.prismaService.customDomain.create({
      data: {
        ...omit(input, ['teamId', 'journeyCollectionId']),
        apexName: vercelResult.apexName,
        allowOutsideJourneys: input.allowOutsideJourneys ?? undefined,
        team: { connect: { id: input.teamId } },
        journeyCollection: {
          connect: { id: input.journeyCollectionId ?? undefined }
        }
      }
    })
    return {
      ...customDomain,
      verified: vercelResult.verified,
      verification: vercelResult.verification
    }
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async customDomainDelete(@Args('id') id: string): Promise<boolean> {
    const customDomain = await this.prismaService.customDomain.delete({
      where: { id }
    })
    return await this.customDomainService.deleteVercelDomain(customDomain.name)
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'CustomDomain'
    id: string
  }): Promise<CustomDomain | null> {
    return await this.findDomain(reference.id)
  }

  private async findDomain(id: string): Promise<CustomDomain | null> {
    const customDomain = await this.prismaService.customDomain.findUnique({
      where: { id }
    })
    if (customDomain == null) return null

    const vercelResult = await this.customDomainService.verifyVercelDomain(
      customDomain.name
    )

    return {
      ...customDomain,
      verified: vercelResult.verified,
      verification: vercelResult.verification
    }
  }
}
