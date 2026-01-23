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

  return (
    <RadioQuestion
      {...props}
      id={id}
      addOption={
        props.children.length < 12
          ? () =>
              handleCreateRadioOption({
                dispatch,
                addBlock,
                radioOptionBlockCreate,
                parentBlockId: id,
                journey,
                selectedStep: undefined,
                siblingCount: selectedBlock?.children?.length
              })
          : undefined
      }
      wrappers={wrappers}
    />
  )
}
