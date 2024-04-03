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

import {
  CustomDomain,
  Journey,
  JourneyCollection,
  Prisma
} from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  JourneyCollectionCreateInput,
  JourneyCollectionUpdateInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
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
    @Args('input') input: JourneyCollectionCreateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<JourneyCollection> {
    return await this.prismaService.$transaction(async (tx) => {
      const data: Prisma.JourneyCollectionCreateInput = {
        ...omit(input, ['teamId', 'customDomain', 'journeyIds']),
        id: input.id ?? undefined,
        team: { connect: { id: input.teamId } }
      }
      if (input.journeyIds != null && input.journeyIds.length > 0) {
        data.journeyCollectionJourneys = {
          createMany: {
            data: input.journeyIds.map((id, index) => ({
              order: index,
              journeyId: id
            }))
          }
        }
      }
      const collection = await tx.journeyCollection.create({
        data,
        include: { team: { include: { userTeams: true } } }
      })
      if (
        !ability.can(Action.Create, subject('JourneyCollection', collection))
      ) {
        throw new GraphQLError(
          'user is not allowed to create journey collection',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }
      let customDomain: CustomDomain | null = null
      if (input.customDomain != null) {
        customDomain = await this.customDomainService.customDomainCreate(
          {
            ...input.customDomain,
            teamId: input.teamId
          },
          ability
        )
        return await tx.journeyCollection.update({
          where: { id: collection.id },
          data: { customDomains: { connect: { id: customDomain.id } } },
          include: { customDomains: true }
        })
      }
      return collection
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCollectionDelete(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<JourneyCollection> {
    const journeyCollection =
      await this.prismaService.journeyCollection.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })
    if (journeyCollection == null) {
      throw new GraphQLError('journey collection not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (
      !ability.can(
        Action.Delete,
        subject('JourneyCollection', journeyCollection)
      )
    ) {
      throw new GraphQLError(
        'user is not allowed to delete journey collection',
        {
          extensions: { code: 'FORBIDDEN' }
        }
      )
    }
    return await this.prismaService.journeyCollection.delete({
      where: { id }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCollectionUpdate(
    @Args('input') input: JourneyCollectionUpdateInput,
    @CaslAbility() ability: AppAbility
  ): Promise<JourneyCollection> {
    const journeyCollection =
      await this.prismaService.journeyCollection.findUnique({
        where: { id: input.id },
        include: { team: { include: { userTeams: true } } }
      })
    if (journeyCollection == null) {
      throw new GraphQLError('journey collection not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (
      !ability.can(
        Action.Update,
        subject('JourneyCollection', journeyCollection)
      )
    ) {
      throw new GraphQLError(
        'user is not allowed to update journey collection',
        {
          extensions: { code: 'FORBIDDEN' }
        }
      )
    }

    if (input.journeyIds != null) {
      await this.prismaService.journeyCollectionJourneys.deleteMany({
        where: { journeyCollectionId: input.id }
      })
      if (input.journeyIds.length > 0) {
        await this.prismaService.journeyCollectionJourneys.createMany({
          data: input.journeyIds.map((id, index) => ({
            order: index,
            journeyId: id,
            journeyCollectionId: input.id
          }))
        })
      }
    }

    return await this.prismaService.journeyCollection.update({
      where: { id: input.id },
      data: {
        ...omit(input, ['id', 'journeyIds'])
      }
    })
  }

  @ResolveField()
  async customDomains(
    @Parent() journeyCollection: JourneyCollection
  ): Promise<CustomDomain[]> {
    return await this.prismaService.customDomain.findMany({
      where: { journeyCollectionId: journeyCollection.id }
    })
  }

  @ResolveField()
  async journeys(journeyCollection: JourneyCollection): Promise<Journey[]> {
    const result = await this.prismaService.journeyCollectionJourneys.findMany({
      where: { journeyCollectionId: journeyCollection.id },
      include: { journey: true }
    })

    return result?.map(({ journey }) => journey) ?? []
  }
}
