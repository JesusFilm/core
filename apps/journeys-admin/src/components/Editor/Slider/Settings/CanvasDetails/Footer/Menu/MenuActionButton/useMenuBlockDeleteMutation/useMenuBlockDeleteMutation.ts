import {
  MutationHookOptions,
  MutationTuple,
  Reference,
  gql,
  useMutation
} from '@apollo/client'

import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'

import {
  MenuBlockDelete,
  MenuBlockDeleteVariables
} from '../../../../../../../../../../__generated__/MenuBlockDelete'

export const MENU_BLOCK_DELETE = gql`
  ${STEP_FIELDS}
  mutation MenuBlockDelete(
    $journeyId: ID!
    $stepId: ID!
    $cardId: ID!
    $typographyId: ID!
    $journeyUpdateInput: JourneyUpdateInput!
  ) {
    stepDelete: blockDelete(id: $stepId) {
      id
      parentOrder
    }
    cardDelete: blockDelete(id: $cardId) {
      id
      parentOrder
    }
    typographyDelete: blockDelete(id: $typographyId) {
      id
      parentOrder
    }
    journeyUpdate(id: $journeyId, input: $journeyUpdateInput) {
      menuStepBlock {
        ...StepFields
      }
    }
  }
`

export function removeCachedBlocks(cache, blocks, journeyId): void {
  if (journeyId == null || blocks == null) return

  blocks.forEach((block) => {
    cache.modify({
      id: cache.identify({ __typename: 'Journey', id: journeyId }),
      fields: {
        blocks(existingBlockRefs: Reference[], { readField }) {
          return existingBlockRefs.filter(
            (ref) => readField('id', ref) !== block.id
          )
        }
      }
    })
    cache.evict({
      id: cache.identify({
        __typename: block.__typename,
        id: block.id
      })
    })
    cache.gc()
  })
}

export function useMenuBlockDeleteMutation(
  options?: MutationHookOptions<MenuBlockDelete, MenuBlockDeleteVariables>
): MutationTuple<MenuBlockDelete, MenuBlockDeleteVariables> {
  const mutation = useMutation<MenuBlockDelete, MenuBlockDeleteVariables>(
    MENU_BLOCK_DELETE,
    {
      ...options
    }
  )

  return mutation
}
