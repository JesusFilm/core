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

import { Journey, JourneyCollection } from '.prisma/api-journeys-client'

import {
  CustomDomain,
  JourneyCollectionCreateInput,
  JourneyCollectionUpdateInput
} from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'
import { CustomDomainService } from '../customDomain/customDomain.service'

@Resolver('JourneyCollection')
export class JourneyCollectionResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly customDomainService: CustomDomainService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async journeyCollection(
    @Args('id') id: string
  ): Promise<JourneyCollection | null> {
    return await this.prismaService.journeyCollection.findUnique({
      where: { id }
    })
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeyCollections(
    @Args('teamId') teamId: string
  ): Promise<JourneyCollection[]> {
    return await this.prismaService.journeyCollection.findMany({
      where: { teamId }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCollectionCreate(
    @Args('input') input: JourneyCollectionCreateInput
  ): Promise<JourneyCollection> {
    let customDomain: CustomDomain | null = null
    if (input.customDomain != null) {
      customDomain = await this.customDomainService.customDomainCreate({
        ...input.customDomain,
        teamId: input.teamId
      })
    }
    return await this.prismaService.journeyCollection.create({
      data: {
        ...omit(input, ['teamId', 'customDomain']),
        id: input.id ?? undefined,
        team: { connect: { id: input.teamId } },
        customDomains:
          customDomain != null
            ? { connect: { id: customDomain.id } }
            : undefined
      }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCollectionDelete(
    @Args('id') id: string
  ): Promise<JourneyCollection> {
    return await this.prismaService.journeyCollection.delete({
      where: { id }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCollectionUpdate(
    @Args('input') input: JourneyCollectionUpdateInput
  ): Promise<JourneyCollection> {
    return await this.prismaService.journeyCollection.update({
      where: { id: input.id },
      data: {
        ...omit(input, 'id')
      }
    })
  }

  @ResolveReference()
  async resolveReference(reference: {
    __typename: 'JourneyCollection'
    id: string
  }): Promise<JourneyCollection | null> {
    return await this.journeyCollection(reference.id)
  }

  @ResolveField()
  async customDomains(
    @Parent() journeyCollection: JourneyCollection
  ): Promise<Array<{ __typename: 'CustomDomain'; id: string }>> {
    const customDomains = await this.prismaService.customDomain.findMany({
      where: { journeyCollectionId: journeyCollection.id },
      select: { id: true }
    })
    return (
      customDomains.map((customDomain) => ({
        __typename: 'CustomDomain',
        id: customDomain.id
      })) ?? []
    )
  }

  @ResolveField()
  async journeys(journeyCollection: JourneyCollection): Promise<Journey[]> {
    const result = await this.prismaService.journeyCollection.findUnique({
      where: { id: journeyCollection.id },
      select: { journeys: true }
    })

    return result?.journeys ?? []
  }
}
