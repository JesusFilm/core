import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'

import { BaseService } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { Block, Journey } from '../../__generated__/graphql'

@Injectable()
export class BlockService extends BaseService {
  async forJourney(journey: Journey): Promise<Block[]> {
    const primaryImageBlockId = journey.primaryImageBlock?.id
    const ignorePrimaryImageBlock =
      primaryImageBlockId !== null
        ? `AND block.id != ${primaryImageBlockId ?? 'null'}`
        : ''
    const res = await this.db.query(aql`
      FOR block in ${this.collection}
        FILTER block.journeyId == ${journey.id}
          AND block.journeyId != ${ignorePrimaryImageBlock}
        SORT block.parentOrder ASC
        RETURN block
    `)
    return await res.all()
  }

  async getSiblings(
    journeyId: string,
    parentBlockId?: string | null
  ): Promise<Block[]> {
    // Only StepBlocks should not have parentBlockId
    const filterParentBlockId =
      parentBlockId != null ? `AND block.parentBlockId == ${parentBlockId}` : ''
    const res = await this.db.query(aql`
      FOR block in ${this.collection}
        FILTER block.journeyId == ${journeyId}
          ${filterParentBlockId}
        SORT block.parentOrder ASC
        RETURN block
    `)
    return await res.all()
  }

  collection: DocumentCollection = this.db.collection('blocks')
}
