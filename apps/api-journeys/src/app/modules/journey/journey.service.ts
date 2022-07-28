import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import {
  Journey,
  JourneyStatus,
  UserJourneyRole,
  JourneysFilter,
  Role
} from '../../__generated__/graphql'

@Injectable()
export class JourneyService extends BaseService {
  @KeyAsId()
  async getAllPublishedJourneys(filter?: JourneysFilter): Promise<Journey[]> {
    if (filter?.featured === true) {
      return await (
        await this.db.query(aql`
          FOR journey IN ${this.collection}
            FILTER journey.status == ${JourneyStatus.published}
              AND journey.featuredAt != null
            RETURN journey
        `)
      ).all()
    } else if (filter?.featured === false) {
      return await (
        await this.db.query(aql`
          FOR journey IN ${this.collection}
            FILTER journey.status == ${JourneyStatus.published}
              AND journey.featuredAt == null
            RETURN journey
        `)
      ).all()
    }
    return await (
      await this.db.query(aql`
        FOR journey IN ${this.collection}
          FILTER journey.status == ${JourneyStatus.published}
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
  async getAllByIds(userId: string, ids: string[]): Promise<Journey[]> {
    const result = await this.db.query(aql`
    FOR userJourney in userJourneys
      FOR journey in ${this.collection}
          FILTER userJourney.journeyId == journey._key && userJourney.userId == ${userId}
           && userJourney.role == ${UserJourneyRole.owner}
           && journey._key IN ${ids}
          RETURN journey
    `)
    return await result.all()
  }

  @KeyAsId()
  async getAllByOwnerEditor(
    userId: string,
    status?: JourneyStatus[],
    template?: boolean
  ): Promise<Journey[]> {
    const statusFilter =
      status != null ? aql`&& journey.status IN ${status}` : aql`&& true`

    const roleFilter =
      template === true
        ? aql`FOR user in userRoles
          FILTER user.userId == ${userId} &&  ${Role.publisher} IN user.roles
            FILTER journey.template == true`
        : aql`FOR userJourney in userJourneys
          FILTER userJourney.journeyId == journey._key && userJourney.userId == ${userId}
            && (userJourney.role == ${UserJourneyRole.owner} || userJourney.role == ${UserJourneyRole.editor})`

    const result = await this.db.query(aql`
      FOR journey in ${this.collection}
        ${roleFilter}
        ${statusFilter}
          RETURN journey
    `)
    return await result.all()
  }

  collection: DocumentCollection = this.db.collection('journeys')
}
