import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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
  options?: useMutation.Options<CoverBlockDelete, CoverBlockDeleteVariables>
): useMutation.ResultTuple<CoverBlockDelete, CoverBlockDeleteVariables> {
  return useMutation<CoverBlockDelete, CoverBlockDeleteVariables>(
    COVER_BLOCK_DELETE,
    options
  )
}
