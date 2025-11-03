import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Info, Query, Resolver } from '@nestjs/graphql'
import { GraphQLError, GraphQLResolveInfo, Kind, SelectionNode } from 'graphql'
import pull from 'lodash/pull'
import snakeCase from 'lodash/snakeCase'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Journey, Prisma } from '@core/prisma/journeys/client'

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
    const result = await this.plausibleService.getStatsRealtimeVisitors(
      journey.id,
      'journey'
    )
    return result
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeysPlausibleStatsAggregate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug,
    @Info() info: GraphQLResolveInfo,
    @Args('where') where: PlausibleStatsAggregateFilter
  ): Promise<PlausibleStatsAggregateResponse> {
    const journey = await this.loadJourney(ability, id, idType)

    const result = await this.plausibleService.getStatsAggregate(
      journey.id,
      'journey',
      { metrics: this.getMetrics(info), ...where }
    )
    return result
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeysPlausibleStatsBreakdown(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug,
    @Info() info: GraphQLResolveInfo,
    @Args('where') where: PlausibleStatsBreakdownFilter
  ): Promise<PlausibleStatsResponse[]> {
    const journey = await this.loadJourney(ability, id, idType)

    const result = await this.plausibleService.getStatsBreakdown(
      journey.id,
      'journey',
      { metrics: this.getMetrics(info), ...where }
    )
    return result
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async journeysPlausibleStatsTimeseries(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('idType') idType: IdType = IdType.slug,
    @Info() info: GraphQLResolveInfo,
    @Args('where') where: PlausibleStatsTimeseriesFilter
  ): Promise<PlausibleStatsResponse[]> {
    const journey = await this.loadJourney(ability, id, idType)

    const result = await this.plausibleService.getStatsTimeseries(
      journey.id,
      'journey',
      { metrics: this.getMetrics(info), ...where }
    )
    return result
  }

  private getMetrics(info: GraphQLResolveInfo): string {
    const metrics = pull(
      this.getFieldNames(
        info,
        info.fieldNodes[0].selectionSet?.selections ?? []
      ),
      'property',
      'typename'
    ).join(',')
    return metrics === '' ? 'visitors' : metrics
  }

  private getFieldNames(
    info: GraphQLResolveInfo,
    selections: readonly SelectionNode[]
  ): string[] {
    return selections.flatMap((item) => {
      switch (item.kind) {
        case Kind.FIELD:
          return snakeCase(item.name.value)
        case Kind.FRAGMENT_SPREAD:
          return this.getFieldNames(
            info,
            info.fragments[item.name.value].selectionSet.selections
          )
        default:
          return ''
      }
    })
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
