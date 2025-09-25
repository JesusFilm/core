import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { MULTISELECT_OPTION_FIELDS } from '@core/journeys/ui/MultiselectOption/multiselectOptionFields'
import { MULTISELECT_QUESTION_FIELDS } from '@core/journeys/ui/MultiselectQuestion/multiselectQuestionFields'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import CheckSquareContainedIcon from '@core/shared/ui/icons/CheckSquareContained'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_MultiselectBlock as MultiselectBlock,
  BlockFields_MultiselectOptionBlock as MultiselectOptionBlock
} from '../../../../../../../../__generated__/BlockFields'
import type { MultiselectBlockCreate } from '../../../../../../../../__generated__/MultiselectBlockCreate'
import {
  ButtonAlignment,
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'
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

// Create Multiselect (with two options) and a Submit Button (with icons) in one go
export const MULTISELECT_WITH_BUTTON_CREATE = gql`
  ${MULTISELECT_QUESTION_FIELDS}
  ${MULTISELECT_OPTION_FIELDS}
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation MultiselectWithButtonCreate(
    $multiselectInput: MultiselectBlockCreateInput!
    $optionInput1: MultiselectOptionBlockCreateInput!
    $optionInput2: MultiselectOptionBlockCreateInput!
    $buttonInput: ButtonBlockCreateInput!
    $iconInput1: IconBlockCreateInput!
    $iconInput2: IconBlockCreateInput!
    $buttonId: ID!
    $journeyId: ID!
    $buttonUpdateInput: ButtonBlockUpdateInput!
  ) {
    multiselectBlockCreate(input: $multiselectInput) {
      id
      parentBlockId
      parentOrder
      ...MultiselectQuestionFields
    }
    multiselectOption1: multiselectOptionBlockCreate(input: $optionInput1) {
      id
      parentBlockId
      parentOrder
      ...MultiselectOptionFields
    }
    multiselectOption2: multiselectOptionBlockCreate(input: $optionInput2) {
      id
      parentBlockId
      parentOrder
      ...MultiselectOptionFields
    }
    button: buttonBlockCreate(input: $buttonInput) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $iconInput1) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $iconInput2) {
      ...IconFields
    }
    buttonUpdate: buttonBlockUpdate(
      id: $buttonId
      journeyId: $journeyId
      input: $buttonUpdateInput
    ) {
      ...ButtonFields
    }
  }
`

// Delete created Submit Button (and icons) plus Multiselect and options
export const MULTISELECT_WITH_BUTTON_DELETE = gql`
  mutation MultiselectWithButtonDelete(
    $multiselectId: ID!
    $option1Id: ID!
    $option2Id: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
    endIcon: blockDelete(id: $endIconId) {
      id
      parentOrder
    }
    startIcon: blockDelete(id: $startIconId) {
      id
      parentOrder
    }
    button: blockDelete(id: $buttonId) {
      id
      parentOrder
    }
    option2: blockDelete(id: $option2Id) {
      id
      parentOrder
    }
    option1: blockDelete(id: $option1Id) {
      id
      parentOrder
    }
    multiselect: blockDelete(id: $multiselectId) {
      id
      parentOrder
    }
  }
`

// Restore created Submit Button (and icons) plus Multiselect and options
export const MULTISELECT_WITH_BUTTON_RESTORE = gql`
  mutation MultiselectWithButtonRestore(
    $multiselectId: ID!
    $option1Id: ID!
    $option2Id: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
    multiselect: blockRestore(id: $multiselectId) {
      id
      parentBlockId
      parentOrder
      __typename
    }
    option1: blockRestore(id: $option1Id) {
      id
      parentBlockId
      parentOrder
      __typename
    }
    option2: blockRestore(id: $option2Id) {
      id
      parentBlockId
      parentOrder
      __typename
    }
    button: blockRestore(id: $buttonId) {
      id
      parentBlockId
      parentOrder
      __typename
    }
    startIcon: blockRestore(id: $startIconId) {
      id
      parentBlockId
      parentOrder
      __typename
    }
    endIcon: blockRestore(id: $endIconId) {
      id
      parentBlockId
      parentOrder
      __typename
    }
  }
`

export function NewMultiselectButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [multiselectBlockCreate, { loading }] =
    useMutation<MultiselectBlockCreate>(MULTISELECT_BLOCK_CREATE)
  const [multiselectWithButtonCreate, { loading: withButtonLoading }] =
    useMutation(MULTISELECT_WITH_BUTTON_CREATE)
  const [multiselectWithButtonDelete] = useMutation(
    MULTISELECT_WITH_BUTTON_DELETE
  )
  const [multiselectWithButtonRestore] = useMutation(
    MULTISELECT_WITH_BUTTON_RESTORE
  )
  const { journey } = useJourney()
  const {
    state: { selectedStep, selectedBlockId },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card == null || journey == null) return

    const previousBlockId = selectedBlockId

    const hasSubmitButton = card.children.some(
      (block) =>
        block.__typename === 'ButtonBlock' &&
        (block as TreeBlock<ButtonBlock>).submitEnabled === true
    )

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

    if (!hasSubmitButton) {
      const buttonBlock: ButtonBlock = {
        id: uuidv4(),
        __typename: 'ButtonBlock',
        parentBlockId: card.id,
        label: '',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        parentOrder: card.children.length + 3, // after multiselect + 2 options
        startIconId: uuidv4(),
        endIconId: uuidv4(),
        action: null,
        submitEnabled: true,
        settings: {
          __typename: 'ButtonBlockSettings',
          alignment: ButtonAlignment.justify
        }
      }

      const blocks = { multiselectBlock, option1, option2, buttonBlock }

      add({
        parameters: {
          execute: {},
          undo: { previousBlockId, blocks },
          redo: { multiselectId: multiselectBlock.id, blocks }
        },
        execute() {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: multiselectBlock.id,
            activeSlide: ActiveSlide.Content
          })
          void multiselectWithButtonCreate({
            variables: {
              multiselectInput: {
                id: multiselectBlock.id,
                journeyId: journey.id,
                parentBlockId: multiselectBlock.parentBlockId,
                label: multiselectBlock.label
              },
              optionInput1: {
                id: option1.id,
                journeyId: journey.id,
                parentBlockId: multiselectBlock.id,
                label: option1.label
              },
              optionInput2: {
                id: option2.id,
                journeyId: journey.id,
                parentBlockId: multiselectBlock.id,
                label: option2.label
              },
              buttonInput: {
                id: buttonBlock.id,
                journeyId: journey.id,
                parentBlockId: card.id,
                label: buttonBlock.label,
                variant: buttonBlock.buttonVariant,
                color: buttonBlock.buttonColor,
                size: buttonBlock.size,
                submitEnabled: true,
                settings: { alignment: ButtonAlignment.justify }
              },
              iconInput1: {
                id: buttonBlock.startIconId,
                journeyId: journey.id,
                parentBlockId: buttonBlock.id,
                name: null
              },
              iconInput2: {
                id: buttonBlock.endIconId,
                journeyId: journey.id,
                parentBlockId: buttonBlock.id,
                name: null
              },
              buttonId: buttonBlock.id,
              journeyId: journey.id,
              buttonUpdateInput: {
                startIconId: buttonBlock.startIconId,
                endIconId: buttonBlock.endIconId
              }
            },
            optimisticResponse: {
              multiselectBlockCreate: multiselectBlock,
              multiselectOption1: option1,
              multiselectOption2: option2,
              button: buttonBlock,
              startIcon: {
                id: buttonBlock.startIconId as string,
                parentBlockId: buttonBlock.id,
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                __typename: 'IconBlock'
              },
              endIcon: {
                id: buttonBlock.endIconId as string,
                parentBlockId: buttonBlock.id,
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                __typename: 'IconBlock'
              },
              buttonUpdate: buttonBlock
            },
            update(cache, { data }) {
              blockCreateUpdate(cache, journey.id, data?.multiselectBlockCreate)
              blockCreateUpdate(cache, journey.id, data?.multiselectOption1)
              blockCreateUpdate(cache, journey.id, data?.multiselectOption2)
              blockCreateUpdate(cache, journey.id, data?.button)
              blockCreateUpdate(cache, journey.id, data?.startIcon)
              blockCreateUpdate(cache, journey.id, data?.endIcon)
            }
          })
        },
        undo({ previousBlockId, blocks }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: previousBlockId,
            activeSlide: ActiveSlide.Content
          })
          void multiselectWithButtonDelete({
            variables: {
              multiselectId: blocks.multiselectBlock.id,
              option1Id: blocks.option1.id,
              option2Id: blocks.option2.id,
              buttonId: blocks.buttonBlock.id,
              startIconId: blocks.buttonBlock.startIconId as string,
              endIconId: blocks.buttonBlock.endIconId as string
            },
            optimisticResponse: {
              multiselect: [],
              option1: [],
              option2: [],
              button: [],
              startIcon: [],
              endIcon: []
            }
          })
        },
        redo({ multiselectId, blocks }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: multiselectId,
            activeSlide: ActiveSlide.Content
          })
          void multiselectWithButtonRestore({
            variables: {
              multiselectId: blocks.multiselectBlock.id,
              option1Id: blocks.option1.id,
              option2Id: blocks.option2.id,
              buttonId: blocks.buttonBlock.id,
              startIconId: blocks.buttonBlock.startIconId as string,
              endIconId: blocks.buttonBlock.endIconId as string
            },
            optimisticResponse: {
              multiselect: [blocks.multiselectBlock],
              option1: [blocks.option1],
              option2: [blocks.option2],
              button: [blocks.buttonBlock],
              startIcon: [
                {
                  id: blocks.buttonBlock.startIconId as string,
                  parentBlockId: blocks.buttonBlock.id,
                  parentOrder: null,
                  iconName: null,
                  iconSize: null,
                  iconColor: null,
                  __typename: 'IconBlock'
                }
              ],
              endIcon: [
                {
                  id: blocks.buttonBlock.endIconId as string,
                  parentBlockId: blocks.buttonBlock.id,
                  parentOrder: null,
                  iconName: null,
                  iconSize: null,
                  iconColor: null,
                  __typename: 'IconBlock'
                }
              ]
            }
          })
        }
      })
    } else {
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
  }

  return (
    <Button
      icon={<CheckSquareContainedIcon />}
      value={t('Multiselect')}
      onClick={handleClick}
      testId="NewMultiselectButton"
      disabled={loading || withButtonLoading}
    />
  )
}
