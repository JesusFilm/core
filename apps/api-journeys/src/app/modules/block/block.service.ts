import { Injectable } from '@nestjs/common'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId, idAsKey } from '@core/nest/decorators'

import { Block, Journey } from '../../__generated__/graphql'

@Injectable()
export class BlockService extends BaseService {
  @KeyAsId()
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

  @KeyAsId()
  async getSiblings(
    journeyId: string,
    parentBlockId?: string | null
  ): Promise<Block[]> {
    return await this.getSiblingsInternal(journeyId, parentBlockId)
  }

  async getSiblingsInternal(
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
            AND block.parentOrder != null
          SORT block.parentOrder ASC
          RETURN block
    `)
        : await this.db.query(aql`
        FOR block in ${this.collection}
          FILTER block.journeyId == ${journeyId}
            AND block.parentOrder != null
          SORT block.parentOrder ASC
          RETURN block
    `)
    return await res.all()
  }

  async reorderSiblings(
    siblings: Block[] | Array<{ _key: string; parentOrder: number }>
  ): Promise<Block[]> {
    const updatedSiblings = siblings.map((block, index) => ({
      ...block,
      parentOrder: index
    }))
    return await this.updateAll(updatedSiblings)
  }

  @KeyAsId()
  async reorderBlock(
    id: string,
    journeyId: string,
    parentOrder: number
  ): Promise<Block[]> {
    const block = idAsKey(await this.get(id)) as Block

    if (block.journeyId === journeyId && block.parentOrder != null) {
      const siblings = await this.getSiblingsInternal(
        journeyId,
        block.parentBlockId
      )
      siblings.splice(block.parentOrder, 1)
      siblings.splice(parentOrder, 0, block)

      return await this.reorderSiblings(siblings)
    }
    return []
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

  @KeyAsId()
  async removeBlockAndChildren(
    blockId: string,
    journeyId: string,
    parentBlockId?: string
  ): Promise<Block[]> {
    const res: Block = await this.remove(blockId)
    await this.removeAllBlocksForParentId([blockId], [res])
    const result =
      parentBlockId == null
        ? []
        : await this.reorderSiblings(
            await this.getSiblingsInternal(journeyId, parentBlockId)
          )

    return result as unknown as Block[]
  }

  async validateBlock(
    id: string | null,
    parentBlockId: string | null
  ): Promise<boolean> {
    const block: Block | null = id != null ? await this.get(id) : null

    return block != null ? block.parentBlockId === parentBlockId : false
  }

  collection: DocumentCollection = this.db.collection('blocks')
}
