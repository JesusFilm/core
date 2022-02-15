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

  async updateChildrenParentOrder(
    journeyId: string,
    parentBlockId: string
  ): Promise<Array<{ _key: string; parentOrder: number }>> {
    const siblings = await this.getSiblings(journeyId, parentBlockId)
    const updatedSiblings = siblings.map((block, index) => ({
      _key: block.id,
      parentOrder: index
    }))
    return await this.updateAll(updatedSiblings)
  }

  protected async removeAllBlocksForParentId(
    parentIds: string[],
    blockArray: Block[] = []
  ): Promise<Block[]> {
    if (parentIds.length === 0) {
      return blockArray
    }
    const res = await this.db.query(aql`
      FOR block IN ${this.collection}
        FILTER block.parentBlockId IN ${parentIds}
        REMOVE block IN ${this.collection} RETURN OLD
    `)
    const blocks = await res.all()
    const blockIds = blocks.map((block) => block._key)
    return await this.removeAllBlocksForParentId(blockIds, [
      ...blockArray,
      ...blocks
    ])
  }

  async removeBlockAndChildren(
    blockId: string,
    parentBlockId: string,
    journeyId: string
  ): Promise<Block[]> {
    const res: Block = await this.remove(blockId)
    await this.updateChildrenParentOrder(journeyId, parentBlockId)
    return await this.removeAllBlocksForParentId([blockId], [res])
  }

  collection: DocumentCollection = this.db.collection('blocks')
}
