import {
  MutationHookOptions,
  MutationTuple,
  Reference,
  gql,
  useMutation
} from '@apollo/client'
import compact from 'lodash/compact'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
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
}`

export function useBlockRestoreMutation(
  options?: MutationHookOptions<BlockRestore, BlockRestoreVariables>
): MutationTuple<BlockRestore, BlockRestoreVariables> {
  const { journey } = useJourney()

  return useMutation<BlockRestore, BlockRestoreVariables>(BLOCK_RESTORE, {
    update(cache, { data }, { variables }) {
      if (data != null) {
        const selected = data.blockRestore.find(
          (block) => variables?.id === block.id
        )
        const cacheOptions = {
          fields: {
            blocks(existingBlockRefs: Reference[], { readField }) {
              const newBlockRef = data.blockRestore.map((block) => {
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
        if (selected != null && journey != null) {
          cache.modify({
            ...cacheOptions,
            id: cache.identify({
              __typename: 'Journey',
              id: journey?.id
            })
          })
          if (selected.__typename === 'StepBlock') {
            cache.modify(cacheOptions)
          }
        }
      }
    },
    ...options
  })
}
