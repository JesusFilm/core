import {
  MutationHookOptions,
  MutationTuple,
  Reference,
  gql,
  useMutation
} from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
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
  const { journey } = useJourney()

  return useMutation<BlockRestore, BlockRestoreVariables>(BLOCK_RESTORE, {
    update(cache, { data }, { variables }) {
      if (data != null) {
        const selected = data.blockRestore.find(
          (block) => variables?.blockRestoreId === block.id
        )
        const cacheOptions = {
          fields: {
            blocks(existingBlockRefs: Reference[] = [], { readField }) {
              data.blockRestore.forEach((block) => {
                const newBlockRef = cache.writeFragment({
                  data: block,
                  fragment: gql`
                        fragment RestoredBlock on Block {
                          id
                        }
                      `
                })
                if (
                  existingBlockRefs.some(
                    (ref) => readField('id', ref) === block?.id
                  )
                ) {
                  return existingBlockRefs
                }
                return [...existingBlockRefs, newBlockRef]
              })
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
