import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'

import { BaseService } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { Block, Journey } from '../../__generated__/graphql'

@Injectable()
export class BlockService extends BaseService {
  async forJourney(journey: Journey): Promise<Block[]> {
    const primaryImageBlockId = journey.primaryImageBlock?.id ?? null
    const res = await this.db.query(aql`
      FOR block in ${this.collection}
        FILTER block.journeyId == ${journey.id}
          AND block._key != ${primaryImageBlockId}
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
    const res =
      parentBlockId != null
        ? await this.db.query(aql`
        FOR block in ${this.collection}
          FILTER block.journeyId == ${journeyId}
            AND block.parentBlockId == ${parentBlockId}
          SORT block.parentOrder ASC
          RETURN block
    `)
        : await this.db.query(aql`
        FOR block in ${this.collection}
          FILTER block.journeyId == ${journeyId}
          SORT block.parentOrder ASC
          RETURN block
    `)
    return await res.all()
  }

  private async removeAllBlocksForParentId(
    parentIds: string[],
    blockArray: Block[] = []
  ): Promise<Block[]> {
    if (parentIds.length === 0) {
      return blockArray
    }
    const blocks = await this.db.query(aql`
      FOR block IN ${this.collection}
        FILTER block.parentBlockId IN ${parentIds}
        REMOVE block IN ${this.collection}
    `)
    const blockIds = (await blocks.all()).map((block) => block._key)
    return await this.removeAllBlocksForParentId(blockIds, [
      ...blockArray,
      ...blockIds
    ])
  }

  async removeBlockAndChildren(blockId: string): Promise<Block[]> {
    return await this.removeAllBlocksForParentId([blockId])
  }

  collection: DocumentCollection = this.db.collection('blocks')
}
