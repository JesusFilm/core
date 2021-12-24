import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Typography, ButtonGroup } from '@mui/material'
import { useMutation, gql } from '@apollo/client'
import { TreeBlock } from '../..'
import { RadioOption } from './RadioOption'
import { RadioQuestionResponseCreate } from './__generated__/RadioQuestionResponseCreate'
import { RadioQuestionFields } from './__generated__/RadioQuestionFields'

const RADIO_QUESTION_RESPONSE_CREATE = gql`
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
    <>
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
    </>
  )
}

export { RADIO_QUESTION_RESPONSE_CREATE }
