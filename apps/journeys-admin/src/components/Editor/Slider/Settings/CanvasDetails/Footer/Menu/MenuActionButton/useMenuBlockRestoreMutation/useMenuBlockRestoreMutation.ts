import {
  MutationHookOptions,
  MutationTuple,
  Reference,
  gql,
  useMutation
} from '@apollo/client'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'

import {
  MenuBlockRestore,
  MenuBlockRestoreVariables
} from '../../../../../../../../../../__generated__/MenuBlockRestore'

export const MENU_BLOCK_RESTORE = gql`
  ${BLOCK_FIELDS}
  ${STEP_FIELDS}
  mutation MenuBlockRestore(
    $journeyId: ID!
    $stepId: ID!
    $journeyUpdateInput: JourneyUpdateInput!
  ) {
    stepRestore: blockRestore(id: $stepId) {
      id
      ...BlockFields
      ... on StepBlock {
        id
        x
        y
      }
    }
    journeyUpdate(id: $journeyId, input: $journeyUpdateInput) {
      id
      menuStepBlock {
        ...StepFields
      }
    }
  }
`

export function restoreCache(cache, data, journeyId): void {
  if (data == null || journeyId == null) return
  const keys = Object.keys(data).filter((key) => key !== 'journeyUpdate')

  keys.forEach((key) => {
    data[key].forEach((block) => {
      cache.modify({
        id: cache.identify({ __typename: 'Journey', id: journeyId }),
        fields: {
          blocks(existingBlockRefs: Reference[], { readField }) {
            const newBlockRef = gql`
              fragment NewBlock on Block {
                id
              }
            `

            if (
              existingBlockRefs.some((ref) => readField('id', ref) === block.id)
            ) {
              return existingBlockRefs
            }

            return [
              ...existingBlockRefs,
              cache.writeFragment({
                data: block,
                fragment: newBlockRef
              })
            ]
          }
        }
      })
    })
  })
}

export function useMenuBlockRestoreMutation(
  options?: MutationHookOptions<MenuBlockRestore, MenuBlockRestoreVariables>
): MutationTuple<MenuBlockRestore, MenuBlockRestoreVariables> {
  const { journey } = useJourney()
  const mutation = useMutation<MenuBlockRestore, MenuBlockRestoreVariables>(
    MENU_BLOCK_RESTORE,
    {
      ...options,
      update(...args) {
        options?.update?.(...args)
        const [cache, { data }] = args
        restoreCache(cache, data, journey?.id)
      }
    }
  )

  return mutation
}
