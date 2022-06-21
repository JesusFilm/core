import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { aql } from 'arangojs'
import { BaseService } from '@core/nest/database'
import { DocumentCollection } from 'arangojs/collection'
import { KeyAsId, idAsKey, keyAsId } from '@core/nest/decorators'

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
  ): Promise<Array<Block & { _key: string }>> {
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
            AND block.__typename == 'StepBlock'
            AND block.parentOrder != null
          SORT block.parentOrder ASC
          RETURN block
    `)
    return await res.all()
  }

  async reorderSiblings(
    siblings: Array<Block & { _key: string }>
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
    const block = idAsKey(await this.get(id)) as Block & { _key: string }

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

  async duplicateBlock(
    id: string,
    journeyId: string,
    parentOrder?: number
  ): Promise<Block[]> {
    const block = idAsKey(await this.get(id)) as Block & { _key: string }

    if (block.journeyId === journeyId) {
      const blockAndChildrenData = await this.getDuplicateBlockAndChildren(
        id,
        journeyId,
        block.parentBlockId ?? null
      )
      const duplicateBlockAndChildren: Block[] = await this.saveAll(
        blockAndChildrenData
      )
      const duplicatedBlock = {
        ...duplicateBlockAndChildren[0],
        _key: duplicateBlockAndChildren[0].id
      }
      const duplicatedChildren = duplicateBlockAndChildren.slice(1)

      // Newly duplicated block returns with original block and siblings.
      const siblings = await this.getSiblingsInternal(
        journeyId,
        block.parentBlockId
      )
      const defaultDuplicateBlockIndex = siblings.findIndex(
        (block) => block.id === duplicatedBlock.id
      )
      const insertIndex =
        parentOrder != null ? parentOrder : siblings.length + 1
      siblings.splice(defaultDuplicateBlockIndex, 1)
      siblings.splice(insertIndex, 0, duplicatedBlock)
      const reorderedBlocks: Block[] = await this.reorderSiblings(siblings)

      return reorderedBlocks.concat(duplicatedChildren)
    }
    return []
  }

  async getDuplicateBlockAndChildren(
    id: string,
    journeyId: string,
    parentBlockId: string | null,
    duplicateId?: string
  ): Promise<Array<Block & { _key: string }>> {
    const block = keyAsId(await this.get(id)) as Block & {
      __typename: string
      startIconId: string | null
      endIconId: string | null
      coverBlockId: string | null
      posterBlockId: string | null
    }
    const duplicateBlockId = duplicateId ?? uuidv4()

    const children = await this.getBlocksForParentId(block.id, journeyId)
    const childIds = new Map()
    children.forEach((block) => {
      childIds.set(block.id, uuidv4())
    })

    const duplicateBlock =
      block.__typename === 'ButtonBlock'
        ? {
            ...block,
            _key: duplicateBlockId,
            id: duplicateBlockId,
            parentBlockId,
            startIconId: childIds.get(block.startIconId) ?? null,
            endIconId: childIds.get(block.endIconId) ?? null
          }
        : block.__typename === 'CardBlock'
        ? {
            ...block,
            _key: duplicateBlockId,
            id: duplicateBlockId,
            parentBlockId,
            coverBlockId: childIds.get(block.coverBlockId) ?? null
          }
        : block.__typename === 'VideoBlock'
        ? {
            ...block,
            _key: duplicateBlockId,
            id: duplicateBlockId,
            parentBlockId,
            posterBlockId: childIds.get(block.posterBlockId) ?? null
          }
        : block.__typename === 'StepBlock'
        ? {
            ...block,
            _key: duplicateBlockId,
            id: duplicateBlockId,
            parentBlockId,
            nextBlockId: null
          }
        : {
            ...block,
            _key: duplicateBlockId,
            id: duplicateBlockId,
            parentBlockId
          }

    const duplicateChildren = await Promise.all(
      children.map(async (block) => {
        return await this.getDuplicateBlockAndChildren(
          block.id,
          journeyId,
          duplicateBlockId,
          childIds.get(block.id)
        )
      })
    )
    const childrenFlatArray = duplicateChildren.reduce<
      Array<Block & { _key: string }>
    >((acc, val) => {
      return acc.concat(val)
    }, [])

    return [duplicateBlock, ...childrenFlatArray]
  }

  @KeyAsId()
  async getBlocksForParentId(
    parentId: string,
    journeyId: string
  ): Promise<Block[]> {
    const res = await this.db.query(aql`
      FOR block IN ${this.collection}
        FILTER block.journeyId == ${journeyId}
          AND block.parentBlockId == ${parentId}
        SORT block.parentOrder ASC
        RETURN block
    `)

    return await res.all()
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
    const result = await this.reorderSiblings(
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
