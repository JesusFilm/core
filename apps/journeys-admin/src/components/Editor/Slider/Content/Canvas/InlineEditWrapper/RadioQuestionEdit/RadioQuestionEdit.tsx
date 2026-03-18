import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { WrappersProps } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'

import {
  RadioOptionBlockCreate,
  RadioOptionBlockCreateVariables
} from '../../../../../../../../__generated__/RadioOptionBlockCreate'
import { RadioQuestionFields } from '../../../../../../../../__generated__/RadioQuestionFields'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'

import { handleCreateRadioOption } from './utils/handleCreateRadioOption'

export const RADIO_OPTION_BLOCK_CREATE = gql`
  ${BLOCK_FIELDS}
  mutation RadioOptionBlockCreate($input: RadioOptionBlockCreateInput!) {
    radioOptionBlockCreate(input: $input) {
      id
      label
      ...BlockFields
    }
  }
`

interface RadioQuestionEditProps extends TreeBlock<RadioQuestionFields> {
  wrappers?: WrappersProps
}

/**
 * Editor component for radio question blocks that allows adding new radio options.
 *
 * This component wraps the RadioQuestion component with editor functionality,
 * including the ability to create new radio option blocks. It enforces a maximum
 * of 12 options per radio question and provides an addOption handler when the
 * limit hasn't been reached.
 *
 * @param {RadioQuestionEditProps} props - The component props
 * @param {string} props.id - The unique identifier of the radio question block
 * @param {WrappersProps} [props.wrappers] - Optional wrapper props for block rendering
 * @param {RadioQuestionFields} props - Additional props from TreeBlock<RadioQuestionFields>
 * @returns {ReactElement} The rendered RadioQuestion component with editor capabilities
 */
export function RadioQuestionEdit({
  id,
  wrappers,
  ...props
}: RadioQuestionEditProps): ReactElement {
  const [radioOptionBlockCreate] = useMutation<
    RadioOptionBlockCreate,
    RadioOptionBlockCreateVariables
  >(RADIO_OPTION_BLOCK_CREATE)
  const { journey } = useJourney()
  const { addBlock } = useBlockCreateCommand()
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  const maxOptions = props.children.length >= 12

  return (
    <RadioQuestion
      {...props}
      id={id}
      addOption={
        !maxOptions
          ? () =>
              handleCreateRadioOption({
                dispatch,
                addBlock,
                radioOptionBlockCreate,
                parentBlockId: id,
                journey,
                siblingCount: props.children.length
              })
          : undefined
      }
      wrappers={wrappers}
    />
  )
}
