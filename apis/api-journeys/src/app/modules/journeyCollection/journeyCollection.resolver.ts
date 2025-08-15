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
  Prisma
} from '@core/prisma/journeys/client'

import {
  JourneyCollectionCreateInput,
  JourneyCollectionUpdateInput
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('JourneyCollection')
export class JourneyCollectionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async journeyCollection(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<JourneyCollection> {
    const journeyCollection =
      await this.prismaService.journeyCollection.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })
    if (journeyCollection == null)
      throw new GraphQLError('journey collection not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (
      !ability.can(Action.Read, subject('JourneyCollection', journeyCollection))
    )
      throw new GraphQLError('user is not allowed to read journey collection', {
        extensions: { code: 'FORBIDDEN' }
      })
    return journeyCollection
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeyCollections(
    @Args('teamId') teamId: string,
    @CaslAccessible('JourneyCollection')
    accessibleJourneyCollections: Prisma.JourneyCollectionWhereInput
  ): Promise<JourneyCollection[]> {
    return await this.prismaService.journeyCollection.findMany({
      where: { AND: [accessibleJourneyCollections, { teamId }] }
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
        const journeys = await tx.journey.findMany({
          where: { id: { in: input.journeyIds }, teamId: input.teamId },
          select: { id: true }
        })
        const journeyIds = input.journeyIds.filter((id) =>
          journeys.some((j) => j.id === id)
        )
        data.journeyCollectionJourneys = {
          createMany: {
            data: journeyIds.map((journeyId, order) => ({
              order,
              journeyId
            }))
          }
        }
      }
      const collection = await tx.journeyCollection.create({
        data,
        include: { team: { include: { userTeams: true } } }
      })
      if (!ability.can(Action.Create, subject('JourneyCollection', collection)))
        throw new GraphQLError(
          'user is not allowed to create journey collection',
          { extensions: { code: 'FORBIDDEN' } }
        )
      return collection
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCollectionUpdate(
    @Args('id') id: string,
    @Args('input') input: JourneyCollectionUpdateInput,
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
        Action.Update,
        subject('JourneyCollection', journeyCollection)
      )
    )
      throw new GraphQLError(
        'user is not allowed to update journey collection',
        { extensions: { code: 'FORBIDDEN' } }
      )

    return await this.prismaService.$transaction(async (tx) => {
      if (input.journeyIds != null) {
        await tx.journeyCollectionJourneys.deleteMany({
          where: { journeyCollectionId: id }
        })
        if (input.journeyIds.length > 0) {
          const journeys = await tx.journey.findMany({
            where: {
              id: { in: input.journeyIds },
              teamId: journeyCollection.teamId
            },
            select: { id: true }
          })
          const journeyIds = input.journeyIds.filter((id) =>
            journeys.some((j) => j.id === id)
          )
          await tx.journeyCollectionJourneys.createMany({
            data: journeyIds.map((journeyId, order) => ({
              order,
              journeyId,
              journeyCollectionId: id
            }))
          })
        }
      }

      return await tx.journeyCollection.update({
        where: { id },
        data: {
          ...omit(input, ['id', 'journeyIds'])
        }
      })
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
    )
      throw new GraphQLError(
        'user is not allowed to delete journey collection',
        { extensions: { code: 'FORBIDDEN' } }
      )
    return await this.prismaService.journeyCollection.delete({
      where: { id }
    })
  }

  @ResolveField()
  async customDomains(
    @Parent() { id: journeyCollectionId }: JourneyCollection
  ): Promise<CustomDomain[]> {
    return await this.prismaService.customDomain.findMany({
      where: { journeyCollectionId }
    })
  }

  @ResolveField()
  async journeys({
    id: journeyCollectionId
  }: JourneyCollection): Promise<Journey[]> {
    return await this.prismaService.journey.findMany({
      where: {
        journeyCollectionJourneys: { some: { journeyCollectionId } }
      }
    })
  }
}
