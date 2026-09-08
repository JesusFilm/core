import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import {
  CoverBlockRestore,
  CoverBlockRestoreVariables
} from '../../../__generated__/CoverBlockRestore'

export const COVER_BLOCK_RESTORE = gql`
  ${VIDEO_FIELDS}
  ${IMAGE_FIELDS}
  mutation CoverBlockRestore($id: ID!, $cardBlockId: ID!) {
    blockRestore(id: $id) {
      id
      ... on VideoBlock {
        ...VideoFields
      }
      ... on ImageBlock {
        ...ImageFields
      }
    }
    cardBlockUpdate(id: $cardBlockId, input: { coverBlockId: $id }) {
      id
      coverBlockId
    }
  }
`

export function useCoverBlockRestoreMutation(
  options?: useMutation.Options<CoverBlockRestore, CoverBlockRestoreVariables>
): useMutation.ResultTuple<CoverBlockRestore, CoverBlockRestoreVariables> {
  return useMutation<CoverBlockRestore, CoverBlockRestoreVariables>(
    COVER_BLOCK_RESTORE,
    options
  )
}
