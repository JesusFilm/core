import { Inject, Injectable } from '@nestjs/common'
import { aql, Database } from 'arangojs'

import { BaseService } from '../database/base.service'
import { DocumentCollection } from 'arangojs/collection'

@Injectable()
export class RadioQuestionService extends BaseService {
  constructor(@Inject('DATABASE') private readonly db: Database) {
    super()
  }

  collection: DocumentCollection = this.db.collection('responses')
}
