import { ReactElement } from 'react'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import { RadioOption } from '../RadioOption'
import { GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { useMutation, gql } from '@apollo/client'
import { RadioQuestionResponseCreate } from '../../../../__generated__/RadioQuestionResponseCreate'
import { v4 as uuidv4 } from 'uuid'

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

interface RadioQuestionProps extends TreeBlock<RadioQuestionBlock> {
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
