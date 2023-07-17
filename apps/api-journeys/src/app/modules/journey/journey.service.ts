import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import includes from 'lodash/includes'
import { AqlQuery } from 'arangojs/aql'
import {
  Journey,
  JourneyStatus,
  UserJourneyRole,
  JourneysFilter,
  Role,
  UserRole
} from '../../__generated__/graphql'

@Injectable()
export class JourneyService extends BaseService {
  journeyFilter(filter?: JourneysFilter): AqlQuery {
    const { featured, template } = filter ?? {}

    return aql.join(
      [
        template === true
          ? aql`AND journey.template == true`
          : aql`AND journey.template != true`,
        featured === true && aql`AND journey.featuredAt != null`,
        featured === false && aql`AND journey.featuredAt == null`
      ].filter((x) => x !== false)
    )
  }

  @KeyAsId()
  async getAllPublishedJourneys(filter?: JourneysFilter): Promise<Journey[]> {
    const search = this.journeyFilter(filter)

    return await (
      await this.db.query(aql`FOR journey IN ${this.collection}
          FILTER journey.status == ${JourneyStatus.published}
          ${search}
          RETURN journey
      `)
    ).all()
  }

  @KeyAsId()
  async getBySlug(_key: string): Promise<Journey> {
    const result = await this.db.query(aql`
      FOR journey in ${this.collection}
        FILTER journey.slug == ${_key}
          AND journey.status IN ${[
            JourneyStatus.published,
            JourneyStatus.draft,
            JourneyStatus.archived
          ]}
        LIMIT 1
        RETURN journey
    `)
    return await result.next()
  }

  @KeyAsId()
  async getAllByTitle(title: string, userId: string): Promise<Journey[]> {
    const result = await this.db.query(aql`
    FOR userJourney in userJourneys
      FOR journey in ${this.collection}
        FILTER CONTAINS(journey.title, ${title}) && userJourney.journeyId == journey._key && userJourney.userId == ${userId} && journey.status IN ${[
      JourneyStatus.published,
      JourneyStatus.draft
    ]}
        RETURN journey
    `)
    return await result.all()
  }

  @KeyAsId()
  async getAllByIds(ids: string[]): Promise<Journey[]> {
    const result = await this.db.query(aql`
      FOR journey in ${this.collection}
          FILTER journey._key IN ${ids}
          RETURN journey
    `)
    return await result.all()
  }

  @KeyAsId()
  async getAllByHost(hostId: string): Promise<Journey[]> {
    const result = await this.db.query(aql`
      FOR journey in ${this.collection}
          FILTER journey.hostId == ${hostId}
          RETURN journey
    `)
    return await result.all()
  }

  @KeyAsId()
  async getAllByRole(
    user: UserRole,
    status?: JourneyStatus[],
    template?: boolean
  ): Promise<Journey[]> {
    if (template === true && !includes(user.roles, Role.publisher)) return []

    const statusFilter =
      status != null ? aql`&& journey.status IN ${status}` : aql`&& true`

    const roleFilter =
      template === true
        ? aql`FOR journey in ${this.collection}
              FILTER journey.template == true`
        : aql`FOR userJourney in userJourneys
          FOR journey in ${this.collection}
            FILTER userJourney.journeyId == journey._key && userJourney.userId == ${user.userId}
              && (userJourney.role == ${UserJourneyRole.owner} || userJourney.role == ${UserJourneyRole.editor})`

    const result = await this.db.query(aql`${roleFilter}
          ${statusFilter}
            RETURN journey
      `)
    return await result.all()
  }

  collection = this.db.collection('journeys')
}
