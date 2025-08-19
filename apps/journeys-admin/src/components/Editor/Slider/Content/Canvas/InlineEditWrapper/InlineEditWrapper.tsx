import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  WrapperProps,
  type WrappersProps
} from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { Typography } from '@core/journeys/ui/Typography'

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
    | SignUpFields,
    { wrappers?: WrappersProps }
  > {}

export function InlineEditWrapper({
  block,
  children
}: InlineEditWrapperProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedBlock }
  } = useEditor()

  const showEditable =
    selectedBlock?.id === block.id ||
    (block.__typename === 'RadioQuestionBlock' &&
      selectedBlock?.parentBlockId === block.id)

  let component = children

  switch (block.__typename) {
    case 'TypographyBlock':
      component = showEditable ? (
        <TypographyEdit {...block} />
      ) : (
        <Typography {...block} placeholderText={t('Add your text here...')} />
      )
      break
    case 'ButtonBlock':
      if (showEditable) component = <ButtonEdit {...block} />
      break
    case 'RadioOptionBlock':
      if (showEditable) component = <RadioOptionEdit {...block} />
      break
    case 'RadioQuestionBlock':
      if (showEditable)
        component = (
          <RadioQuestionEdit {...block} wrappers={children.props.wrappers} />
        )
      break
    case 'SignUpBlock':
      if (showEditable) component = <SignUpEdit {...block} />
      break
  }

  return component
}
