import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RADIO_OPTION_FIELDS } from '@core/journeys/ui/RadioOption/radioOptionFields'
import { RADIO_QUESTION_FIELDS } from '@core/journeys/ui/RadioQuestion/radioQuestionFields'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'

import type {
  BlockFields_CardBlock as CardBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock
} from '../../../../../../../../__generated__/BlockFields'
import type { RadioQuestionBlockCreate } from '../../../../../../../../__generated__/RadioQuestionBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { Button } from '../Button'

export const RADIO_QUESTION_BLOCK_CREATE = gql`
  ${RADIO_QUESTION_FIELDS}
  ${RADIO_OPTION_FIELDS}
  mutation RadioQuestionBlockCreate(
    $input: RadioQuestionBlockCreateInput!
    $radioOptionBlockCreateInput1: RadioOptionBlockCreateInput!
    $radioOptionBlockCreateInput2: RadioOptionBlockCreateInput!
  ) {
    radioQuestionBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...RadioQuestionFields
    }
    radioOption1: radioOptionBlockCreate(input: $radioOptionBlockCreateInput1) {
      id
      parentBlockId
      parentOrder
      ...RadioOptionFields
    }
    radioOption2: radioOptionBlockCreate(input: $radioOptionBlockCreateInput2) {
      id
      parentBlockId
      parentOrder
      ...RadioOptionFields
    }
  }
`

export function NewRadioQuestionButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [radioQuestionBlockCreate, { loading }] =
    useMutation<RadioQuestionBlockCreate>(RADIO_QUESTION_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card == null || journey == null) return

    const radioQuestionBlock: RadioQuestionBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      gridView: false,
      __typename: 'RadioQuestionBlock'
    }
    const radioOptionBlock1: RadioOptionBlock = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 0,
      label: t('Option 1'),
      action: null,
      pollOptionImageBlockId: null,
      __typename: 'RadioOptionBlock'
    }
    const radioOptionBlock2: RadioOptionBlock = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 1,
      label: t('Option 2'),
      action: null,
      pollOptionImageBlockId: null,
      __typename: 'RadioOptionBlock'
    }

    addBlock({
      block: radioQuestionBlock,
      execute() {
        void radioQuestionBlockCreate({
          variables: {
            input: {
              journeyId: journey.id,
              id: radioQuestionBlock.id,
              parentBlockId: radioQuestionBlock.parentBlockId
            },
            radioOptionBlockCreateInput1: {
              id: radioOptionBlock1.id,
              journeyId: journey.id,
              parentBlockId: radioQuestionBlock.id,
              label: radioOptionBlock1.label
            },
            radioOptionBlockCreateInput2: {
              id: radioOptionBlock2.id,
              journeyId: journey.id,
              parentBlockId: radioQuestionBlock.id,
              label: radioOptionBlock2.label
            }
          },
          optimisticResponse: {
            radioQuestionBlockCreate: radioQuestionBlock,
            radioOption1: radioOptionBlock1,
            radioOption2: radioOptionBlock2
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey.id, data?.radioQuestionBlockCreate)
            blockCreateUpdate(cache, journey.id, data?.radioOption1)
            blockCreateUpdate(cache, journey.id, data?.radioOption2)
          }
        })
      }
    })
  }

  return (
    <Button
      icon={<CheckContainedIcon />}
      value={t('Poll')}
      onClick={handleClick}
      testId="NewRadioQuestionButton"
      disabled={loading}
    />
  )
}
