import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  TreeBlock,
  useEditor,
  RADIO_OPTION_FIELDS,
  RADIO_QUESTION_FIELDS
} from '@core/journeys/ui'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../../Button'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { RadioQuestionBlockCreate } from '../../../../../../__generated__/RadioQuestionBlockCreate'
import { useJourney } from '../../../../../libs/context'

const RADIO_QUESTION_BLOCK_CREATE = gql`
  ${RADIO_QUESTION_FIELDS}
  ${RADIO_OPTION_FIELDS}
  mutation RadioQuestionBlockCreate(
    $input: RadioQuestionBlockCreateInput!
    $radioOptionBlockCreateInput1: RadioOptionBlockCreateInput!
    $radioOptionBlockCreateInput2: RadioOptionBlockCreateInput!
  ) {
    radioQuestionBlockCreate(input: $input) {
      journeyId
      label
      parentBlockId
      ...RadioQuestionFields
    }
    radioOption1: radioOptionBlockCreate(input: $radioOptionBlockCreateInput1) {
      journeyId
      label
      parentBlockId
      ...RadioOptionFields
    }
    radioOption2: radioOptionBlockCreate(input: $radioOptionBlockCreateInput2) {
      journeyId
      label
      parentBlockId
      ...RadioOptionFields
    }
  }
`

export function RadioQuestion(): ReactElement {
  const [radioQuestionBlockCreate] = useMutation<RadioQuestionBlockCreate>(
    RADIO_QUESTION_BLOCK_CREATE
  )
  const { id: journeyId } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const handleClick = async (): Promise<void> => {
    const radioQuestionId = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card != null) {
      const { data } = await radioQuestionBlockCreate({
        variables: {
          input: {
            journeyId,
            id: radioQuestionId,
            parentBlockId: card.id,
            label: 'Your Question Here?'
          },
          radioOptionBlockCreateInput1: {
            journeyId,
            parentBlockId: radioQuestionId,
            label: 'Option 1'
          },
          radioOptionBlockCreateInput2: {
            journeyId,
            parentBlockId: radioQuestionId,
            label: 'Option 2'
          }
        },
        update(cache, { data }) {
          if (data?.radioQuestionBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journeyId }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.radioQuestionBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [...existingBlockRefs, newBlockRef]
                }
              }
            })
          }
        }
      })
      if (data?.radioQuestionBlockCreate != null) {
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          id: data.radioQuestionBlockCreate.id
        })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
      }
    }
  }

  return (
    <Button
      icon={<ContactSupportRounded />}
      value="Poll"
      onClick={handleClick}
    />
  )
}
