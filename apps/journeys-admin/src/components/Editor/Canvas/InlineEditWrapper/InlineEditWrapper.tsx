import { ReactElement } from 'react'
import { useEditor, ActiveFab } from '@core/journeys/ui/EditorProvider'
import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { RadioQuestionFields } from '../../../../../__generated__/RadioQuestionFields'
import { RadioOptionFields } from '../../../../../__generated__/RadioOptionFields'
import { SignUpFields } from '../../../../../__generated__/SignUpFields'
import { TextResponseFields } from '../../../../../__generated__/TextResponseFields'
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
  const {
    state: { selectedBlock, activeFab }
  } = useEditor()

  const showEditable =
    (activeFab === ActiveFab.Save && selectedBlock?.id === block.id) ||
    (block.__typename === 'RadioQuestionBlock' &&
      selectedBlock?.parentBlockId === block.id)

  const EditComponent =
    block.__typename === 'TypographyBlock' ? (
      <TypographyEdit {...block} />
    ) : block.__typename === 'ButtonBlock' ? (
      <ButtonEdit {...block} />
    ) : block.__typename === 'RadioOptionBlock' ? (
      <RadioOptionEdit {...block} />
    ) : block.__typename === 'RadioQuestionBlock' ? (
      <RadioQuestionEdit {...block} wrappers={children.props.wrappers} />
    ) : block.__typename === 'TextResponseBlock' ? (
      <TextResponseEdit {...block} />
    ) : block.__typename === 'SignUpBlock' ? (
      <SignUpEdit {...block} />
    ) : (
      children
    )

  return showEditable ? EditComponent : children
}
