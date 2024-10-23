import { ApolloCache, Reference } from '@apollo/client'
import reject from 'lodash/reject'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_ButtonBlock_action_NavigateToBlockAction } from '@core/journeys/ui/block/__generated__/BlockFields'

import { BlockDelete } from '../../../__generated__/BlockDelete'

interface BlockIdentifier {
  __typename: TreeBlock['__typename']
  id: string
  children?: BlockIdentifier[]
}

interface UpdatedBlockIdentifier {
  __typename: TreeBlock['__typename']
  id: string
  nextBlockId?: string | null
  // action: BlockFields_ButtonBlock_action_NavigateToBlockAction
}

interface DeleteBlockResponce {
  blockDelete:
    | Array<BlockIdentifier & { parentOrder: number | null }>
    | undefined
  blockDeleteReferences: UpdatedBlockIdentifier[] | undefined
}

const getNestedChildRefs = (
  block: BlockIdentifier,
  results: string[] = []
): string[] => {
  results.push(`${block.__typename}:${block.id}`)
  block.children?.forEach((child) => getNestedChildRefs(child, results))
  return results
}

export const blockDeleteUpdate = (
  selectedBlock: BlockIdentifier,
  response: BlockDelete | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: ApolloCache<any>,
  journeyId: string
): void => {
  if (response?.blockDelete != null) {
    response.blockDelete.forEach((block) => {
      cache.modify({
        id: cache.identify({
          __typename: block.__typename,
          id: block.id
        }),
        fields: {
          parentOrder() {
            return block.parentOrder
          }
        }
      })
    })
    const blockRefs = getNestedChildRefs(selectedBlock)
    cache.modify({
      id: cache.identify({ __typename: 'Journey', id: journeyId }),
      fields: {
        blocks(existingBlockRefs: Reference[]) {
          return reject(existingBlockRefs, (block) => {
            return blockRefs.includes(block.__ref)
          })
        }
      }
    })
    if (selectedBlock.__typename === 'StepBlock') {
      cache.modify({
        fields: {
          blocks(existingBlockRefs = []) {
            return existingBlockRefs.filter(
              (blockRef) => blockRef.__ref !== `StepBlock:${selectedBlock.id}`
            )
          }
        }
      })
    }
    blockRefs.forEach((blockRef) => {
      cache.evict({
        id: blockRef
      })
    })
  }

  if (response?.blockDeleteReferences != null) {
    // Handle cache update for updated blocks (restore null references)
    console.log('updating nextBlockId for ', response.blockDeleteReferences)
    response.blockDeleteReferences.forEach((block) => {
      if (block.__typename === 'StepBlock') {
        cache.modify({
          id: cache.identify({
            __typename: block.__typename,
            id: block.id
          }),
          fields: {
            nextBlockId: () => block.nextBlockId
          }
        })
      }

      // // TODO(jk): need to handle more like isActionBlock
      // if (
      //   block.__typename === 'ButtonBlock' ||
      //   block.__typename === 'RadioOptionBlock'
      // ) {
      //   cache.modify({
      //     id: cache.identify({
      //       __typename: block.__typename,
      //       id: block.id
      //     }),
      //     fields: {
      //       action: () => block.action
      //     }
      //   })
      // }
    })
  }
}
