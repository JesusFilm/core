import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { EventType, VisitorEvent } from '../../__generated__/graphql'

@Injectable()
export class EventService extends BaseService {
  collection: DocumentCollection = this.db.collection('events')

  @KeyAsId()
  async getVisitorEvents(
    visitorId: string,
    eventTypes: [EventType]
  ): Promise<VisitorEvent[]> {
    const res = await this.db.query(aql`
      FOR event IN events
        FILTER event.visitorId == ${visitorId}
        AND event.__typename IN ${eventTypes}
          RETURN event
    `)
    return await res.all()
  }
}
