import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  CoverBlockDelete,
  CoverBlockDeleteVariables
} from '../../../__generated__/CoverBlockDelete'

export const COVER_BLOCK_DELETE = gql`
  mutation CoverBlockDelete($id: ID!, $cardBlockId: ID!) {
    blockDelete(id: $id) {
      id
      parentOrder
    }
    cardBlockUpdate(id: $cardBlockId, input: { coverBlockId: null }) {
      id
      coverBlockId
    }
  }
`

export function useCoverBlockDeleteMutation(
  options?: MutationHookOptions<CoverBlockDelete, CoverBlockDeleteVariables>
): MutationTuple<CoverBlockDelete, CoverBlockDeleteVariables> {
  return useMutation<CoverBlockDelete, CoverBlockDeleteVariables>(
    COVER_BLOCK_DELETE,
    options
  )
}
