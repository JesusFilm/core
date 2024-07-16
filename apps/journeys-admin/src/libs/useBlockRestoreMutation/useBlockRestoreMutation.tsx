import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import {
  BlockRestore,
  BlockRestoreVariables
} from '../../../__generated__/BlockRestore'
import { blockRestoreCacheUpdate } from './lib/blockRestoreCacheUpdate'

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
        if (selected != null && journey != null) {
          blockRestoreCacheUpdate(
            cache,
            data,
            cache.identify({
              __typename: 'Journey',
              id: journey.id
            })
          )
          if (selected.__typename === 'StepBlock')
            blockRestoreCacheUpdate(cache, data)
        }
      }
    },
    ...options
  })
}
