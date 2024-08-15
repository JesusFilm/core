import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { TreeBlock } from '@core/journeys/ui/block'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import {
  BlockOrderUpdate,
  BlockOrderUpdateVariables
} from '../../../__generated__/BlockOrderUpdate'

export const BLOCK_ORDER_UPDATE = gql`
  mutation BlockOrderUpdate($id: ID!, $parentOrder: Int!) {
    blockOrderUpdate(id: $id, parentOrder: $parentOrder) {
      id
      parentOrder
    }
  }
`

export function useBlockOrderUpdateMutation(
  options?: MutationHookOptions<BlockOrderUpdate, BlockOrderUpdateVariables>
): MutationTuple<BlockOrderUpdate, BlockOrderUpdateVariables> {
  return useMutation<BlockOrderUpdate, BlockOrderUpdateVariables>(
    BLOCK_ORDER_UPDATE,
    options
  )
}

export function getNewParentOrder(
  steps: TreeBlock[],
  selectedBlock: TreeBlock,
  parentOrder: number
): Array<{
  id: string
  parentOrder: number
  __typename: TreeBlock['__typename']
}> {
  let children: TreeBlock[] = []

  if (selectedBlock.__typename === 'StepBlock') {
    children = steps
  } else if (selectedBlock.parentBlockId != null) {
    children = searchBlocks(steps, selectedBlock.parentBlockId)?.children ?? []
  }

  children = children.filter(
    (block) =>
      (selectedBlock.__typename === 'StepBlock' || block.parentOrder != null) &&
      block.id !== selectedBlock.id
  )

  if (children.length === 0) return []

  return [
    ...children.slice(0, parentOrder),
    selectedBlock,
    ...children.slice(parentOrder)
  ].map((block, index) => ({
    id: block.id,
    parentOrder: index,
    __typename: block.__typename
  }))
}
