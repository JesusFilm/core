import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { JourneyCustomizationField } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import { JourneyCustomizationFieldInput } from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { parseCustomizationFieldsFromString } from '../../lib/parseCustomizationFieldsFromString'
import { PrismaService } from '../../lib/prisma.service'

@Resolver('JourneyCustomizationField')
export class JourneyCustomizationFieldResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCustomizationFieldPublisherUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('journeyId') journeyId: string,
    @Args('string') string: string
  ): Promise<JourneyCustomizationField[]> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id: journeyId },
      include: {
        userJourneys: true,
        team: { include: { userTeams: true } }
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (ability.cannot(Action.Manage, subject('Journey', journey), 'template'))
      throw new GraphQLError(
        'user is not allowed to update journey customization field',
        {
          extensions: { code: 'FORBIDDEN' }
        }
      )

    if (!journey.template)
      throw new GraphQLError('journey is not a template', {
        extensions: { code: 'FORBIDDEN' }
      })

    const customizationFields = parseCustomizationFieldsFromString(
      string,
      journey.id
    )

    await this.prismaService.$transaction(async (tx) => {
      await tx.journeyCustomizationField.deleteMany({
        where: { journeyId: journey.id }
      })
      await tx.journey.update({
        where: { id: journey.id },
        data: {
          journeyCustomizationDescription: string
        }
      })
      await tx.journeyCustomizationField.createMany({
        data: customizationFields
      })
    })

    return this.prismaService.journeyCustomizationField.findMany({
      where: { journeyId: journey.id }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async journeyCustomizationFieldUserUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('journeyId') journeyId: string,
    @Args('input') input: JourneyCustomizationFieldInput[]
  ): Promise<JourneyCustomizationField[]> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id: journeyId },
      include: {
        userJourneys: true,
        team: { include: { userTeams: true } },
        journeyCustomizationFields: true
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })

    if (ability.cannot(Action.Manage, subject('Journey', journey)))
      throw new GraphQLError(
        'user is not allowed to update journey customization field',
        {
          extensions: { code: 'FORBIDDEN' }
        }
      )

    await this.prismaService.$transaction(async (tx) => {
      await Promise.all(
        input.map((i) =>
          tx.journeyCustomizationField.update({
            where: { id: i.id },
            data: { value: i.value }
          })
        )
      )
    })

    return this.prismaService.journeyCustomizationField.findMany({
      where: { journeyId: journey.id }
    })
  }
}
