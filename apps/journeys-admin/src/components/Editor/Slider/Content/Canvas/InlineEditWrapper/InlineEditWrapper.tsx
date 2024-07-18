import { ReactElement } from 'react'

import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ButtonFields } from '../../../../../../../__generated__/ButtonFields'
import { RadioOptionFields } from '../../../../../../../__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../../../../../../__generated__/RadioQuestionFields'
import { SignUpFields } from '../../../../../../../__generated__/SignUpFields'
import { TextResponseFields } from '../../../../../../../__generated__/TextResponseFields'
import { TypographyFields } from '../../../../../../../__generated__/TypographyFields'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../../../libs/useBlockDeleteMutation'
import getSelected from '../QuickControls/DeleteBlock/utils/getSelected'

import { ButtonEdit } from './ButtonEdit'
import { RadioOptionEdit } from './RadioOptionEdit'
import { RadioQuestionEdit } from './RadioQuestionEdit'
import { SignUpEdit } from './SignUpEdit'
import { TypographyEdit } from './TypographyEdit'

interface InlineEditWrapperProps
  extends WrapperProps<
    | TypographyFields
    | ButtonFields
    | RadioQuestionFields
    | RadioOptionFields
    | TextResponseFields
    | SignUpFields
  > {}

export function InlineEditWrapper({
  block,
  children
}: InlineEditWrapperProps): ReactElement {
  const [blockDelete] = useBlockDeleteMutation()

  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()
  const { journey } = useJourney()

  const showEditable =
    selectedBlock?.id === block.id ||
    (block.__typename === 'RadioQuestionBlock' &&
      selectedBlock?.parentBlockId === block.id)

  // TODO: Refactor out delete block logic
  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock == null || journey == null || steps == null) return

    const deletedBlockParentOrder = selectedBlock.parentOrder
    const deletedBlockType = selectedBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    await blockDelete(selectedBlock, {
      update(cache, { data }) {
        if (data?.blockDelete != null && deletedBlockParentOrder != null) {
          const selected = getSelected({
            parentOrder: deletedBlockParentOrder,
            siblings: data.blockDelete,
            type: deletedBlockType,
            steps: stepsBeforeDelete,
            selectedStep: stepBeforeDelete
          })
          selected != null && dispatch(selected)
        }
        blockDeleteUpdate(block, data?.blockDelete, cache, journey.id)
      }
    }).then(() => {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    })
  }

  const EditComponent =
    block.__typename === 'TypographyBlock' ? (
      <TypographyEdit {...block} deleteSelf={handleDeleteBlock} />
    ) : block.__typename === 'ButtonBlock' ? (
      <ButtonEdit {...block} />
    ) : block.__typename === 'RadioOptionBlock' ? (
      <RadioOptionEdit {...block} />
    ) : block.__typename === 'RadioQuestionBlock' ? (
      <RadioQuestionEdit {...block} wrappers={children.props.wrappers} />
    ) : block.__typename === 'SignUpBlock' ? (
      <SignUpEdit {...block} />
    ) : (
      children
    )

  return showEditable ? EditComponent : children
}
