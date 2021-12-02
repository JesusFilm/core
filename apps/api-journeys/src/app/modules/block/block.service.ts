import { Injectable } from '@nestjs/common';
import { aql } from 'arangojs';

import { BaseService } from '../database/base.service';
import { DocumentCollection } from 'arangojs/collection';
import { Block } from '../../graphql';

@Injectable()
export class BlockService extends BaseService {
  async forJourney(_key: string): Promise<Block[]> {
    const res = await this.db.query(aql`
      FOR block in ${this.collection}
        FILTER block.journeyId == ${_key}
        RETURN block
    `);
    return await res.all();
  }

  collection: DocumentCollection = this.db.collection('blocks');
}
