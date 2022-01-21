import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { ReactElement, useContext } from 'react'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  TreeBlock,
  RADIO_OPTION_FIELDS,
  RADIO_QUESTION_FIELDS,
  transformer
} from '@core/journeys/ui'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../../Button'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourneyForEdit'
import { RadioQuestionBlockCreate } from '../../../../../../__generated__/RadioQuestionBlockCreate'

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
  const {
    state: { journey, selectedStep },
    dispatch
  } = useContext(EditorContext)

  const handleClick = async (): Promise<void> => {
    const radioQuestionId = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card != null) {
      const { data } = await radioQuestionBlockCreate({
        variables: {
          input: {
            id: radioQuestionId,
            journeyId: journey.id,
            parentBlockId: card.id,
            label: 'Your Question Here?'
          },
          radioOptionBlockCreateInput1: {
            journeyId: journey.id,
            parentBlockId: radioQuestionId,
            label: 'Option 1'
          },
          radioOptionBlockCreateInput2: {
            journeyId: journey.id,
            parentBlockId: radioQuestionId,
            label: 'Option 2'
          }
        }
      })
      if (data?.radioQuestionBlockCreate != null) {
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({
          type: 'SetSelectedBlockAction',
          block: transformer([data.radioQuestionBlockCreate])[0]
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
