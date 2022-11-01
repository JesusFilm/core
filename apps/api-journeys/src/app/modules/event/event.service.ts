import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database/BaseService'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId } from '@core/nest/decorators/KeyAsId'
import { Event } from '../../__generated__/graphql'

@Injectable()
export class EventService extends BaseService {
  collection: DocumentCollection = this.db.collection('events')

  @KeyAsId()
  async getAllByVisitorId(visitorId: string): Promise<Event[]> {
    const res = await this.db.query(aql`
      FOR event IN ${this.collection}
        FILTER event.visitorId == ${visitorId}
        RETURN event
    `)
    return await res.all()
  }
}
