import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { AqlQuery } from 'arangojs/aql'
import {
  Journey,
  JourneyStatus,
  UserJourneyRole,
  JourneysFilter
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
        featured === true &&
          template !== true &&
          aql`AND journey.featuredAt != null`,
        featured === false &&
          template !== true &&
          aql`AND journey.featuredAt == null`
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
    status?: JourneyStatus[]
  ): Promise<Journey[]> {
    const filter =
      status != null ? aql`&& journey.status IN ${status}` : aql`&& true`
    const result = await this.db.query(aql`
    FOR userJourney in userJourneys
      FOR journey in ${this.collection}
          FILTER userJourney.journeyId == journey._key && userJourney.userId == ${userId}
           && (userJourney.role == ${UserJourneyRole.owner} || userJourney.role == ${UserJourneyRole.editor})
           ${filter}
          RETURN journey
    `)
    return await result.all()
  }

  collection: DocumentCollection = this.db.collection('journeys')
}
