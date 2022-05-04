import { Injectable } from '@nestjs/common'
import { BaseService } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class EventService extends BaseService {
  collection: DocumentCollection = this.db.collection('events')
}
