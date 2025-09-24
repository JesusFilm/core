import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { MULTISELECT_OPTION_FIELDS } from '@core/journeys/ui/MultiselectOption/multiselectOptionFields'
import { MULTISELECT_QUESTION_FIELDS } from '@core/journeys/ui/MultiselectQuestion/multiselectQuestionFields'
import CheckSquareContainedIcon from '@core/shared/ui/icons/CheckSquareContained'

import type {
  BlockFields_CardBlock as CardBlock,
  BlockFields_MultiselectBlock as MultiselectBlock,
  BlockFields_MultiselectOptionBlock as MultiselectOptionBlock
} from '../../../../../../../../__generated__/BlockFields'
import type { MultiselectBlockCreate } from '../../../../../../../../__generated__/MultiselectBlockCreate'
// Note: multiselect option creation is part of the same mutation operation type
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { Button } from '../Button'

export const MULTISELECT_BLOCK_CREATE = gql`
  ${MULTISELECT_QUESTION_FIELDS}
  ${MULTISELECT_OPTION_FIELDS}
  mutation MultiselectBlockCreate(
    $input: MultiselectBlockCreateInput!
    $multiselectOptionBlockCreateInput1: MultiselectOptionBlockCreateInput!
    $multiselectOptionBlockCreateInput2: MultiselectOptionBlockCreateInput!
  ) {
    multiselectBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...MultiselectQuestionFields
    }
    multiselectOption1: multiselectOptionBlockCreate(
      input: $multiselectOptionBlockCreateInput1
    ) {
      id
      parentBlockId
      parentOrder
      ...MultiselectOptionFields
    }
    multiselectOption2: multiselectOptionBlockCreate(
      input: $multiselectOptionBlockCreateInput2
    ) {
      id
      parentBlockId
      parentOrder
      ...MultiselectOptionFields
    }
  }
`

export function NewMultiselectButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [multiselectBlockCreate, { loading }] =
    useMutation<MultiselectBlockCreate>(MULTISELECT_BLOCK_CREATE)
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

    const multiselectBlock: MultiselectBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      label: t('Your label here'),
      min: null,
      max: null,
      action: null,
      __typename: 'MultiselectBlock'
    }

    const option1: MultiselectOptionBlock = {
      id: uuidv4(),
      parentBlockId: multiselectBlock.id,
      parentOrder: 0,
      label: t('Option 1'),
      __typename: 'MultiselectOptionBlock'
    }

    const option2: MultiselectOptionBlock = {
      id: uuidv4(),
      parentBlockId: multiselectBlock.id,
      parentOrder: 1,
      label: t('Option 2'),
      __typename: 'MultiselectOptionBlock'
    }

    addBlock({
      block: multiselectBlock,
      execute() {
        void multiselectBlockCreate({
          variables: {
            input: {
              id: multiselectBlock.id,
              journeyId: journey.id,
              parentBlockId: multiselectBlock.parentBlockId,
              label: multiselectBlock.label
            },
            multiselectOptionBlockCreateInput1: {
              id: option1.id,
              journeyId: journey.id,
              parentBlockId: multiselectBlock.id,
              label: option1.label
            },
            multiselectOptionBlockCreateInput2: {
              id: option2.id,
              journeyId: journey.id,
              parentBlockId: multiselectBlock.id,
              label: option2.label
            }
          },
          optimisticResponse: {
            multiselectBlockCreate: multiselectBlock,
            multiselectOption1: option1,
            multiselectOption2: option2
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey.id, data?.multiselectBlockCreate)
            blockCreateUpdate(cache, journey.id, data?.multiselectOption1)
            blockCreateUpdate(cache, journey.id, data?.multiselectOption2)
          }
        })
      }
    })
  }

  return (
    <Button
      icon={<CheckSquareContainedIcon />}
      value={t('Multiselect')}
      onClick={handleClick}
      testId="NewMultiselectButton"
      disabled={loading}
    />
  )
}
