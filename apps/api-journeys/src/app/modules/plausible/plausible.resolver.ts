import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import pull from 'lodash/pull'
import snakeCase from 'lodash/snakeCase'

import { Journey, Prisma } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

import {
  IdType,
  PlausibleStatsAggregateFilter,
  PlausibleStatsAggregateResponse,
  PlausibleStatsBreakdownFilter,
  PlausibleStatsResponse,
  PlausibleStatsTimeseriesFilter
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { PlausibleService } from './plausible.service'

@Resolver('JourneysPlausible')
export class PlausibleResolver {
  constructor(
    private readonly plausibleService: PlausibleService,
    private readonly prismaService: PrismaService
  ) {}

  @Query()
  @UseGuards(AppCaslGuard)
  async journeysPlausibleStatsRealtimeVisitors(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug
  ): Promise<number> {
    const journey = await this.loadJourney(ability, id, idType)
    return await this.plausibleService.getStatsRealtimeVisitors(
      journey.id,
      'journey'
    )
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeysPlausibleStatsAggregate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug,
    @Info() info,
    @Args('where') where: PlausibleStatsAggregateFilter
  ): Promise<PlausibleStatsAggregateResponse> {
    const journey = await this.loadJourney(ability, id, idType)

    return await this.plausibleService.getStatsAggregate(
      journey.id,
      'journey',
      { metrics: this.getMetrics(info), ...where }
    )
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeysPlausibleStatsBreakdown(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug,
    @Info() info,
    @Args('where') where: PlausibleStatsBreakdownFilter
  ): Promise<PlausibleStatsResponse[]> {
    const journey = await this.loadJourney(ability, id, idType)

    return await this.plausibleService.getStatsBreakdown(
      journey.id,
      'journey',
      { metrics: this.getMetrics(info), ...where }
    )
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeysPlausibleStatsTimeseries(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug,
    @Info() info,
    @Args('where') where: PlausibleStatsTimeseriesFilter
  ): Promise<PlausibleStatsResponse[]> {
    const journey = await this.loadJourney(ability, id, idType)

    return await this.plausibleService.getStatsTimeseries(
      journey.id,
      'journey',
      { metrics: this.getMetrics(info), ...where }
    )
  }

  private getMetrics(info): string {
    const metrics = pull(
      info.fieldNodes[0].selectionSet.selections.map((item) =>
        snakeCase(item.name.value as string)
      ) as string[],
      'property',
      'typename',
      'plausible_journey_referrer_fields'
    ).join(',')
    return metrics === '' ? 'visitors' : metrics
  }

  private async loadJourney(
    ability: AppAbility,
    id: string,
    idType: IdType
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
    if (!ability.can(Action.Update, subject('Journey', journey)))
      throw new GraphQLError('user is not allowed to view journey', {
        extensions: { code: 'FORBIDDEN' }
      })
    return journey
  }
}
