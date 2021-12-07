import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'

import { BaseService } from '../../lib/database/base.service'
import { DocumentCollection } from 'arangojs/collection'
import { Block, Journey } from '../../graphql'

@Injectable()
export class BlockService extends BaseService {
  async forJourney(journey: Journey): Promise<Block[]> {
    const primaryImageBlockId = journey.primaryImageBlock?.id
    const ignorePrimaryImageBlock = primaryImageBlockId !== null ? `AND block.id != ${primaryImageBlockId ?? 'null'}` : ''
    const res = await this.db.query(aql`
      FOR block in ${this.collection}
        FILTER block.journeyId == ${journey.id}
          AND block.journeyId != ${ignorePrimaryImageBlock}
        SORT block.parentOrder ASC
        RETURN block
    `)
    return await res.all()
  }

  collection: DocumentCollection = this.db.collection('blocks')
}
