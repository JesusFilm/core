import { ReactElement } from 'react'

import { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { ButtonFields } from '../../../../../../../__generated__/ButtonFields'
import { RadioOptionFields } from '../../../../../../../__generated__/RadioOptionFields'
import { RadioQuestionFields } from '../../../../../../../__generated__/RadioQuestionFields'
import { SignUpFields } from '../../../../../../../__generated__/SignUpFields'
import { TextResponseFields } from '../../../../../../../__generated__/TextResponseFields'
import { TypographyFields } from '../../../../../../../__generated__/TypographyFields'

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
  const {
    state: { selectedBlock }
  } = useEditor()

  const showEditable =
    selectedBlock?.id === block.id ||
    (block.__typename === 'RadioQuestionBlock' &&
      selectedBlock?.parentBlockId === block.id) ||
    block.__typename === 'TypographyBlock'

  const EditComponent =
    block.__typename === 'TypographyBlock' ? (
      <TypographyEdit {...block} />
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
