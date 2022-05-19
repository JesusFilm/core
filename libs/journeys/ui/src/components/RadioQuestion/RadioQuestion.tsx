import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import { useMutation, gql } from '@apollo/client'
import TagManager from 'react-gtm-module'
import { TreeBlock, BlockRenderer, useJourney } from '../..'
import { WrappersProps } from '../BlockRenderer'
import { RadioOption } from './RadioOption'
import { RadioQuestionSubmissionEventCreate } from './__generated__/RadioQuestionSubmissionEventCreate'
import { RadioQuestionFields } from './__generated__/RadioQuestionFields'

export const RADIO_QUESTION_SUBMISSION_EVENT_CREATE = gql`
  mutation RadioQuestionSubmissionEventCreate(
    $input: RadioQuestionSubmissionEventCreateInput!
  ) {
    radioQuestionSubmissionEventCreate(input: $input) {
      id
      radioOptionBlockId
    }
  }
`

interface RadioQuestionProps extends TreeBlock<RadioQuestionFields> {
  uuid?: () => string
  wrappers?: WrappersProps
  addOption?: ReactElement
}

const StyledRadioQuestion = styled(Box)<BoxProps>(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

export function RadioQuestion({
  id: blockId,
  children,
  uuid = uuidv4,
  wrappers,
  addOption
}: RadioQuestionProps): ReactElement {
  const [radioQuestionSubmissionEventCreate] =
    useMutation<RadioQuestionSubmissionEventCreate>(
      RADIO_QUESTION_SUBMISSION_EVENT_CREATE
    )
  const { admin } = useJourney()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleClick = async (radioOptionBlockId: string): Promise<void> => {
    const id = uuid()
    if (admin != null && !admin) {
      void radioQuestionSubmissionEventCreate({
        variables: {
          input: {
            id,
            blockId,
            radioOptionBlockId
          }
        }
      })
    }
    TagManager.dataLayer({
      dataLayer: {
        event: 'radio_question_submission',
        eventId: id,
        blockId,
        radioOptionSelectedId: radioOptionBlockId
      }
    })
    setSelectedId(radioOptionBlockId)
  }

  const options = children?.map(
    (option) =>
      option.__typename === 'RadioOptionBlock' &&
      (wrappers != null ? (
        <BlockRenderer block={option} wrappers={wrappers} key={option.id} />
      ) : (
        <RadioOption
          {...option}
          key={option.id}
          selected={selectedId === option.id}
          disabled={Boolean(selectedId)}
          onClick={handleClick}
        />
      ))
  )

  return (
    <StyledRadioQuestion data-testid={`radioQuestion-${blockId}`}>
      <ButtonGroup orientation="vertical" variant="contained" fullWidth={true}>
        {options}
        {addOption}
      </ButtonGroup>
    </StyledRadioQuestion>
  )
}
