import {
  ApolloCache,
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { STEP_FIELDS } from '@core/journeys/ui/Step/stepFields'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  MenuBlockCreate,
  MenuBlockCreateVariables
} from '../../../__generated__/MenuBlockCreate'

export const MENU_BLOCK_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${BUTTON_FIELDS}
  mutation MenuBlockCreate(
    $journeyId: ID!
    $stepInput: StepBlockCreateInput!
    $cardInput: CardBlockCreateInput!
    $headingInput: TypographyBlockCreateInput!
    $subHeadingInput: TypographyBlockCreateInput!
    $button1Input: ButtonBlockCreateInput!
    $button2Input: ButtonBlockCreateInput!
    $button3Input: ButtonBlockCreateInput!
    $journeyUpdateInput: JourneyUpdateInput!
  ) {
    step: stepBlockCreate(input: $stepInput) {
      ...StepFields
      x
      y
    }
    card: cardBlockCreate(input: $cardInput) {
      ...CardFields
    }
    heading: typographyBlockCreate(input: $headingInput) {
      ...TypographyFields
    }
    subHeading: typographyBlockCreate(input: $subHeadingInput) {
      ...TypographyFields
    }
    button1: buttonBlockCreate(input: $button1Input) {
      ...ButtonFields
    }
    button2: buttonBlockCreate(input: $button2Input) {
      ...ButtonFields
    }
    button3: buttonBlockCreate(input: $button3Input) {
      ...ButtonFields
    }
    journeyUpdate(id: $journeyId, input: $journeyUpdateInput) {
      id
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
  if (data == null) return

  const keys = Object.keys(data).filter((key) => key !== 'journeyUpdate')

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
      blocks(existingBlockRefs) {
        const NEW_BLOCK_FRAGMENT = gql`
          fragment NewBlock on Block {
            id
          }
        `

        return [
          ...existingBlockRefs,
          ...keys.map((key) =>
            cache.writeFragment({
              data: data[key],
              fragment: NEW_BLOCK_FRAGMENT
            })
          )
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
