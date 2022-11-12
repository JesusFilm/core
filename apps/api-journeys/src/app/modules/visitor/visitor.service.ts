import { BaseService } from '@core/nest/database/BaseService'
import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { GeneratedAqlQuery } from 'arangojs/aql'
import { forEach } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { VisitorsConnection, Visitor } from '../../__generated__/graphql'

interface ListParams {
  after?: string | null
  first: number
  filter: {
    teamId: string
  }
  sortOrder?: 'ASC' | 'DESC'
}

@Injectable()
export class VisitorService extends BaseService {
  collection: DocumentCollection = this.db.collection('visitors')

  @KeyAsId()
  async getList({
    after,
    first,
    filter,
    sortOrder = 'ASC'
  }: ListParams): Promise<VisitorsConnection> {
    const filters: GeneratedAqlQuery[] = []
    if (after != null) filters.push(aql`FILTER item._key > ${after}`)

    forEach(filter, (value, key) => {
      if (value !== undefined) filters.push(aql`FILTER item.${key} == ${value}`)
    })

    const result = await this.db.query(aql`
    LET $edges_plus_one = (
      FOR item IN visitors
        ${aql.join(filters)}
        SORT item.createdAt ${sortOrder}
        LIMIT ${first} + 1
        RETURN { cursor: item._key, node: MERGE({ id: item._key }, item) }
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
  ): Promise<Visitor> {
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

      visitor = await this.collection.save({
        id: uuidv4(),
        teamId: journey.teamId,
        userId,
        createdAt: new Date().toISOString()
      })
    }

    return visitor
  }
}
