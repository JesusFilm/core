import {
  ApolloCache,
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  MenuBlockCreate,
  MenuBlockCreateVariables
} from '../../../../../../../../../../__generated__/MenuBlockCreate'

export const MENU_BLOCK_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  mutation MenuBlockCreate(
    $journeyId: ID!
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
    $typographyBlockCreateInput: TypographyBlockCreateInput!
    $journeyUpdateInput: JourneyUpdateInput!
  ) {
    step: stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    card: cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    }
    typography: typographyBlockCreate(input: $typographyBlockCreateInput) {
      ...TypographyFields
    }
    journeyUpdate(id: $journeyId, input: $journeyUpdateInput) {
      menuStepBlock {
        ...StepFields
      }
    }
  }
`

function updateCache(
  cache: ApolloCache<unknown>,
  data?: MenuBlockCreate | null,
  journeyId?: string | null
): void {
  if (
    journeyId == null ||
    data?.step == null ||
    data?.card == null ||
    data?.typography == null
  )
    return

  cache.modify({
    fields: {
      blocks(existingBlockRefs = []) {
        const newStepBlockRef = cache.writeFragment({
          data: data.step,
          fragment: gql`
            fragment NewBlock on Block {
              id
            }
          `
        })
        return [...existingBlockRefs, newStepBlockRef]
      }
    }
  })
  cache.modify({
    id: cache.identify({ __typename: 'Journey', id: journeyId }),
    fields: {
      // menuStepBlock() {
      //   return data.step
      // },
      blocks(existingBlockRefs) {
        const newStepBlockRef = cache.writeFragment({
          data: data.step,
          fragment: gql`
            fragment NewBlock on Block {
              id
            }
          `
        })
        const newCardBlockRef = cache.writeFragment({
          data: data.card,
          fragment: gql`
            fragment NewBlock on Block {
              id
            }
          `
        })
        const newTypographyBlockRef = cache.writeFragment({
          data: data.typography,
          fragment: gql`
            fragment NewBlock on Block {
              id
            }
          `
        })
        return [
          ...existingBlockRefs,
          newStepBlockRef,
          newCardBlockRef,
          newTypographyBlockRef
        ]
      }
    }
  })
}

export function useMenuBlockCreateMutation(
  options?: MutationHookOptions<MenuBlockCreate, MenuBlockCreateVariables>
): MutationTuple<MenuBlockCreate, MenuBlockCreateVariables> {
  const { journey } = useJourney()
  const mutation = useMutation<MenuBlockCreate, MenuBlockCreateVariables>(
    MENU_BLOCK_CREATE,
    {
      ...options,
      update(...args) {
        options?.update?.(...args)
        const [cache, { data }] = args
        updateCache(cache, data, journey?.id)
      }
    }
  )

  return mutation
}
