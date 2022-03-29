import { ReactElement } from 'react'
import { useEditor, ActiveFab, WrapperProps } from '@core/journeys/ui'
import { TypographyFields } from '../../../../../__generated__/TypographyFields'
import { ButtonFields } from '../../../../../__generated__/ButtonFields'
import { RadioQuestionFields } from '../../../../../__generated__/RadioQuestionFields'
import { RadioOptionFields } from '../../../../../__generated__/RadioOptionFields'
import { SignUpFields } from '../../../../../__generated__/SignUpFields'
import { TypographyEdit } from './TypographyEdit'
import { ButtonEdit } from './ButtonEdit'
import { RadioOptionEdit } from './RadioOptionEdit'
import { SignUpEdit } from './SignUpEdit'

interface InlineEditWrapperProps
  extends WrapperProps<
    | TypographyFields
    | ButtonFields
    | SignUpFields
    | RadioQuestionFields
    | RadioOptionFields
  > {}

export function InlineEditWrapper({
  block,
  children
}: InlineEditWrapperProps): ReactElement {
  const {
    state: { selectedBlock, activeFab }
  } = useEditor()

  const EditComponent =
    block.__typename === 'TypographyBlock' ? (
      <TypographyEdit {...block} />
    ) : block.__typename === 'ButtonBlock' ? (
      <ButtonEdit {...block} />
    ) : block.__typename === 'SignUpBlock' ? (
      <SignUpEdit {...block} />
    ) : block.__typename === 'RadioOptionBlock' ? (
      <RadioOptionEdit {...block} />
    ) : (
      children
    )

  return activeFab === ActiveFab.Save && selectedBlock?.id === block.id
    ? EditComponent
    : children
}
