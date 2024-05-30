import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'

import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../__generated__/StepAndCardBlockCreate'

export const STEP_AND_CARD_BLOCK_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  mutation StepAndCardBlockCreate(
    $stepBlockCreateInput: StepBlockCreateInput!
    $cardBlockCreateInput: CardBlockCreateInput!
  ) {
    stepBlockCreate(input: $stepBlockCreateInput) {
      ...StepFields
      x
      y
    }
    cardBlockCreate(input: $cardBlockCreateInput) {
      ...CardFields
    }
  }
`

export function useStepAndCardBlockCreateMutation(
  options?: MutationHookOptions<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  >
): MutationTuple<StepAndCardBlockCreate, StepAndCardBlockCreateVariables> {
  const { journey } = useJourney()
  const mutation = useMutation<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  >(STEP_AND_CARD_BLOCK_CREATE, {
    ...options,
    update(...args) {
      options?.update?.(...args)
      const [cache, { data }] = args
      if (journey == null) return
      if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
        cache.modify({
          id: cache.identify({ __typename: 'Journey', id: journey.id }),
          fields: {
            blocks(existingBlockRefs = [], { readField }) {
              const newStepBlockRef = cache.writeFragment({
                data: data.stepBlockCreate,
                fragment: gql`
                  fragment NewBlock on Block {
                    id
                  }
                `
              })
              const newCardBlockRef = cache.writeFragment({
                data: data.cardBlockCreate,
                fragment: gql`
                  fragment NewBlock on Block {
                    id
                  }
                `
              })
              return [...existingBlockRefs, newStepBlockRef, newCardBlockRef]
            }
          }
        })
      }
    }
  })

  return mutation
}
