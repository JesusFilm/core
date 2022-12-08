import { ReactElement } from 'react'
import { useMutation } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useEditor, ActiveFab } from '@core/journeys/ui/EditorProvider'
import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { RadioQuestionFields } from '../../../../../__generated__/RadioQuestionFields'
import { RadioOptionFields } from '../../../../../__generated__/RadioOptionFields'
import { SignUpFields } from '../../../../../__generated__/SignUpFields'
import { TextResponseFields } from '../../../../../__generated__/TextResponseFields'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { BlockDelete } from '../../../../../__generated__/BlockDelete'
import { BLOCK_DELETE } from '../../EditToolbar/DeleteBlock/DeleteBlock'
import { TypographyEdit } from './TypographyEdit'
import { ButtonEdit } from './ButtonEdit'
import { RadioOptionEdit } from './RadioOptionEdit'
import { RadioQuestionEdit } from './RadioQuestionEdit'
import { SignUpEdit } from './SignUpEdit'
import { TextResponseEdit } from './TextResponseEdit'

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
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)

  const {
    state: { selectedBlock, activeFab, selectedStep },
    dispatch
  } = useEditor()
  const { journey } = useJourney()

  const showEditable =
    (activeFab === ActiveFab.Save && selectedBlock?.id === block.id) ||
    (block.__typename === 'RadioQuestionBlock' &&
      selectedBlock?.parentBlockId === block.id)

  const handleDeleteBlock = async (): Promise<void> => {
    if (journey == null) return

    await blockDelete({
      variables: {
        id: block.id,
        journeyId: journey.id,
        parentBlockId: block.parentBlockId
      },
      update(cache, { data }) {
        blockDeleteUpdate(block, data?.blockDelete, cache, journey.id)
      }
    })

    if (selectedStep !== undefined) {
      dispatch({
        type: 'SetSelectedBlockByIdAction',
        id: selectedStep.id
      })
    }
  }

  const EditComponent =
    block.__typename === 'TypographyBlock' ? (
      <TypographyEdit {...block} deleteSelf={handleDeleteBlock} visibleCaret={showEditable} />
    ) : block.__typename === 'ButtonBlock' ? (
      <ButtonEdit {...block} visibleCaret={showEditable}/>
    ) : block.__typename === 'RadioOptionBlock' ? (
      <RadioOptionEdit {...block} visibleCaret={showEditable}/>
    ) : block.__typename === 'RadioQuestionBlock' ? (
      <RadioQuestionEdit {...block} wrappers={children.props.wrappers} />
    ) : block.__typename === 'TextResponseBlock' ? (
      <TextResponseEdit {...block} visibleCaret={showEditable}/>
    ) : block.__typename === 'SignUpBlock' ? (
      <SignUpEdit {...block} />
    ) : (
      children
    )

  return EditComponent
}
