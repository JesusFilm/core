import {
  ApolloCache,
  MutationHookOptions,
  MutationTuple,
  Reference,
  gql,
  useMutation
} from '@apollo/client'
import compact from 'lodash/compact'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields } from '../../../__generated__/BlockFields'
import {
  BlockRestore,
  BlockRestoreVariables
} from '../../../__generated__/BlockRestore'

export const BLOCK_RESTORE = gql`
  ${BLOCK_FIELDS}
  mutation BlockRestore($id: ID!) {
    blockRestore(id: $id) {
      id
      ...BlockFields
      ... on StepBlock {
        id
        x
        y
      }
    }
  }
`

export function blockRestoreUpdate(
  selectedBlock: { id: string } | undefined,
  response:
    | Array<{ id: string; __typename: BlockFields['__typename'] }>
    | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: ApolloCache<any>,
  journeyId: string | undefined
): void {
  if (response != null) {
    const selected = response.find((block) => selectedBlock?.id === block.id)
    const cacheOptions = {
      fields: {
        blocks(existingBlockRefs: Reference[], { readField }) {
          const newBlockRef = response.map((block) => {
            if (
              existingBlockRefs.some(
                (ref) => readField('id', ref) === block?.id
              )
            ) {
              return null
            }
            return cache.writeFragment({
              data: block,
              fragment: gql`
                fragment RestoredBlock on Block {
                  id
                }
              `
            })
          })
          return [...existingBlockRefs, ...compact(newBlockRef)]
        }
      }
    }
    if (selected != null && journeyId != null) {
      cache.modify({
        ...cacheOptions,
        id: cache.identify({
          __typename: 'Journey',
          id: journeyId
        })
      })
      if (selected.__typename === 'StepBlock') {
        cache.modify(cacheOptions)
      }
    }
  }
}

export function useBlockRestoreMutation(
  options?: MutationHookOptions<BlockRestore, BlockRestoreVariables>
): MutationTuple<BlockRestore, BlockRestoreVariables> {
  const { journey } = useJourney()

  return useMutation<BlockRestore, BlockRestoreVariables>(BLOCK_RESTORE, {
    update(cache, { data }, { variables }) {
      blockRestoreUpdate(
        variables?.id != null ? { id: variables.id } : undefined,
        data?.blockRestore,
        cache,
        journey?.id
      )
    },
    ...options
  })
}
