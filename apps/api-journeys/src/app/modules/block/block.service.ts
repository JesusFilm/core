import { Inject, Injectable } from '@nestjs/common';
import { aql, Database } from 'arangojs';

import { BaseService } from '../database/base.service';
import { DocumentCollection } from 'arangojs/collection';

@Injectable()
export class BlockService extends BaseService {
  constructor(@Inject('DATABASE') private readonly db: Database) {
    super();
  }

  async forJourney(_key: string) {
    const res = await this.db.query(aql`
      FOR block in ${this.collection}
      FILTER block.journeyId == ${_key}
      RETURN block
    `);
    return res.all();
  }

  collection: DocumentCollection = this.db.collection('blocks');
}
