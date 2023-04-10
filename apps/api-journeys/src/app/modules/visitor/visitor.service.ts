import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { GeneratedAqlQuery } from 'arangojs/aql'
import { forEach } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import {
  VisitorsConnection,
  MessagePlatform
} from '../../__generated__/graphql'

interface ListParams {
  after?: string | null
  first: number
  filter: {
    teamId: string
  }
  sortOrder?: 'ASC' | 'DESC'
}

export interface VisitorRecord {
  id: string
  teamId: string
  userId: string
  createdAt: string
  userAgent?: string
  messagePlatform?: MessagePlatform
  name?: string
  email?: string
}

@Injectable()
export class VisitorService extends BaseService<VisitorRecord> {
  collection = this.db.collection<VisitorRecord>('visitors')

  @KeyAsId()
  async getList({
    after,
    first,
    filter
  }: ListParams): Promise<VisitorsConnection> {
    const filters: GeneratedAqlQuery[] = []
    if (after != null) filters.push(aql`FILTER item.createdAt < ${after}`)

    forEach(filter, (value, key) => {
      if (value !== undefined) filters.push(aql`FILTER item.${key} == ${value}`)
    })

    const result = await this.db.query(aql`
    LET $edges_plus_one = (
      FOR item IN visitors
        ${aql.join(filters)}
        SORT item.createdAt DESC
        LIMIT ${first} + 1
        RETURN { cursor: item.createdAt, node: MERGE(item, { id: item._key }) }
    )
    LET $edges = SLICE($edges_plus_one, 0, ${first})
    RETURN {
      edges: $edges,
      pageInfo: {
        hasNextPage: LENGTH($edges_plus_one) == ${first} + 1,
        startCursor: LENGTH($edges) > 0 ? FIRST($edges).cursor : null,
        endCursor: LENGTH($edges) > 0 ? LAST($edges).cursor : null
      }
    }
    `)
    return await result.next()
  }

  @KeyAsId()
  async getByUserIdAndJourneyId(
    userId: string,
    journeyId: string
  ): Promise<VisitorRecord> {
    let visitor = await (
      await this.db.query(aql`
    FOR v in visitors
      FILTER v.userId == ${userId}
      FOR j in journeys
        FILTER j._key == ${journeyId} AND j.teamId == v.teamId
        LIMIT 1
        RETURN v
  `)
    ).next()

    if (visitor == null) {
      const journey: { teamId: string } = await (
        await this.db.query(aql`
        FOR j in journeys
          FILTER j._key == ${journeyId}
          LIMIT 1
          RETURN j
      `)
      ).next()

      const id = uuidv4()
      visitor = await this.collection.save({
        _key: id,
        id,
        teamId: journey.teamId,
        userId,
        createdAt: new Date().toISOString()
      })
    }

    return visitor
  }
}
