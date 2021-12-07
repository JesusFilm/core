import { Injectable } from '@nestjs/common'

import { BaseService } from '../../lib/database/base.service'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class ResponseService extends BaseService {
  collection: DocumentCollection = this.db.collection('responses')
}
