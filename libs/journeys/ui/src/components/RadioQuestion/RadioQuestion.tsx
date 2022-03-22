import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { styled } from '@mui/material/styles'
import Box, { BoxProps } from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import { useMutation, gql } from '@apollo/client'
import { TreeBlock } from '../..'
import { RadioOption } from './RadioOption'
import { RadioQuestionResponseCreate } from './__generated__/RadioQuestionResponseCreate'
import { RadioQuestionFields } from './__generated__/RadioQuestionFields'

export const RADIO_QUESTION_RESPONSE_CREATE = gql`
  mutation RadioQuestionResponseCreate(
    $input: RadioQuestionResponseCreateInput!
  ) {
    radioQuestionResponseCreate(input: $input) {
      id
      radioOptionBlockId
    }
  }
`

interface RadioQuestionProps extends TreeBlock<RadioQuestionFields> {
  uuid?: () => string
}

const StyledRadioQuestion = styled(Box)<BoxProps>(({ theme }) => ({
  marginBottom: theme.spacing(4)
}))

export function RadioQuestion({
  id: blockId,
  label,
  description,
  children,
  uuid = uuidv4
}: RadioQuestionProps): ReactElement {
  const [radioQuestionResponseCreate, { data }] =
    useMutation<RadioQuestionResponseCreate>(RADIO_QUESTION_RESPONSE_CREATE)

  const handleClick = async (radioOptionBlockId: string): Promise<void> => {
    const id = uuid()
    await radioQuestionResponseCreate({
      variables: {
        input: {
          id,
          blockId,
          radioOptionBlockId
        }
      },
      optimisticResponse: {
        radioQuestionResponseCreate: {
          id,
          __typename: 'RadioQuestionResponse',
          radioOptionBlockId
        }
      }
    })
  }

  const selectedId = data?.radioQuestionResponseCreate?.radioOptionBlockId

  return (
    <StyledRadioQuestion data-testid={`radioQuestion-${blockId}`}>
      <Typography variant="h3" gutterBottom>
        {label}
      </Typography>
      {description != null && (
        <Typography variant="body2" gutterBottom>
          {description}
        </Typography>
      )}
      <ButtonGroup orientation="vertical" variant="contained" fullWidth={true}>
        {children?.map(
          (option) =>
            option.__typename === 'RadioOptionBlock' && (
              <RadioOption
                {...option}
                key={option.id}
                selected={selectedId === option.id}
                disabled={Boolean(selectedId)}
                onClick={handleClick}
              />
            )
        )}
      </ButtonGroup>
    </StyledRadioQuestion>
  )
}
