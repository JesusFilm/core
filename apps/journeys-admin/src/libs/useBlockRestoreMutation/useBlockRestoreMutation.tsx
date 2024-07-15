import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import {
  BlockRestore,
  BlockRestoreVariables
} from '../../../__generated__/BlockRestore'

export const BLOCK_RESTORE = gql`
${BLOCK_FIELDS}
mutation BlockRestore($blockRestoreId: ID!) {
  blockRestore(id: $blockRestoreId) {
    id
    ...BlockFields
    ... on StepBlock {
      id
      x
      y
    }
  }
}`

export function useBlockRestoreMutation(
  options?: MutationHookOptions<BlockRestore, BlockRestoreVariables>
): MutationTuple<BlockRestore, BlockRestoreVariables> {
  return useMutation<BlockRestore, BlockRestoreVariables>(
    BLOCK_RESTORE,
    options
  )
}
