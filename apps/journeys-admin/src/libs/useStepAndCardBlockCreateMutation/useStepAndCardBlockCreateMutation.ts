import { ApolloCache, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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

export function stepBlockCreateUpdate(
  cache: ApolloCache,
  data: StepAndCardBlockCreate | null | undefined,
  journeyId: string | null | undefined
): void {
  if (journeyId == null) return
  if (data?.stepBlockCreate == null && data?.cardBlockCreate == null) return
  cache.modify({
    fields: {
      blocks(existingBlockRefs = []) {
        const newStepBlockRef = cache.writeFragment({
          data: data.stepBlockCreate,
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
      blocks(existingBlockRefs) {
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

export function useStepAndCardBlockCreateMutation(
  options?: useMutation.Options<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  >
): useMutation.ResultTuple<
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
> {
  const { journey } = useJourney()
  const mutation = useMutation<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  >(STEP_AND_CARD_BLOCK_CREATE, {
    ...options,
    update(...args) {
      options?.update?.(...args)
      const [cache, { data }] = args
      stepBlockCreateUpdate(cache, data, journey?.id)
    }
  })

  return mutation
}
