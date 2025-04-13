import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Cursor6Icon from '@core/shared/ui/icons/Cursor6'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock
} from '../../../../../../../../__generated__/BlockFields'
import { ButtonBlockCreate } from '../../../../../../../../__generated__/ButtonBlockCreate'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand/useBlockCreateCommand'
import { Button } from '../Button'

export const BUTTON_BLOCK_CREATE = gql`
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation ButtonBlockCreate(
    $input: ButtonBlockCreateInput!
    $iconBlockCreateInput1: IconBlockCreateInput!
    $iconBlockCreateInput2: IconBlockCreateInput!
    $id: ID!
    $journeyId: ID!
    $updateInput: ButtonBlockUpdateInput!
  ) {
    buttonBlockCreate(input: $input) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $iconBlockCreateInput1) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $iconBlockCreateInput2) {
      ...IconFields
    }
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $updateInput) {
      ...ButtonFields
    }
  }
`

export function NewButtonButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [buttonBlockCreate, { loading }] =
    useMutation<ButtonBlockCreate>(BUTTON_BLOCK_CREATE)
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

    const hasTextInputs = card.children.some(
      (block) => block.__typename === 'TextResponseBlock'
    )

    const hasSubmitButton = card.children.some(
      (block) =>
        block.__typename === 'ButtonBlock' &&
        (block as TreeBlock<ButtonBlock>).submitEnabled === true
    )

    const shouldBeSubmitButton = hasTextInputs && !hasSubmitButton

    const button: ButtonBlock = {
      id: uuidv4(),
      __typename: 'ButtonBlock',
      parentBlockId: card.id,
      label: '',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.medium,
      parentOrder: card.children.length ?? 0,
      startIconId: uuidv4(),
      endIconId: uuidv4(),
      action: null,
      submitEnabled: shouldBeSubmitButton
    }

    addBlock({
      block: button,
      execute() {
        void buttonBlockCreate({
          variables: {
            input: {
              id: button.id,
              journeyId: journey.id,
              parentBlockId: button.parentBlockId,
              label: button.label,
              variant: button.buttonVariant,
              color: button.buttonColor,
              size: button.size,
              submitEnabled: shouldBeSubmitButton
            },
            iconBlockCreateInput1: {
              id: button.startIconId,
              journeyId: journey.id,
              parentBlockId: button.id,
              name: null
            },
            iconBlockCreateInput2: {
              id: button.endIconId,
              journeyId: journey.id,
              parentBlockId: button.id,
              name: null
            },
            id: button.id,
            journeyId: journey.id,
            updateInput: {
              startIconId: button.startIconId,
              endIconId: button.endIconId
            }
          },
          optimisticResponse: {
            buttonBlockCreate: button,
            startIcon: {
              id: button.startIconId as string,
              parentBlockId: button.id,
              parentOrder: null,
              iconName: null,
              iconSize: null,
              iconColor: null,
              __typename: 'IconBlock'
            },
            endIcon: {
              id: button.endIconId as string,
              parentBlockId: button.id,
              parentOrder: null,
              iconName: null,
              iconSize: null,
              iconColor: null,
              __typename: 'IconBlock'
            },
            buttonBlockUpdate: button
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey.id, data?.startIcon)
            blockCreateUpdate(cache, journey.id, data?.endIcon)
            blockCreateUpdate(cache, journey.id, data?.buttonBlockUpdate)
          }
        })
      }
    })
  }

  return (
    <Button
      icon={<Cursor6Icon />}
      value={t('Button')}
      onClick={handleClick}
      testId="NewButton"
      disabled={loading}
    />
  )
}
