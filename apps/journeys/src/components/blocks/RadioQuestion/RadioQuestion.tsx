import { ReactElement } from 'react'
import { Typography, Card, CardContent, ButtonGroup } from '@mui/material'
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

export function RadioQuestion({
  id,
  label,
  description,
  children
}: TreeBlock<RadioQuestionBlock>): ReactElement {
  const [radioQuestionResponseCreate, { data }] =
    useMutation<RadioQuestionResponseCreate>(RADIO_QUESTION_RESPONSE_CREATE)

  const handleClick = async (radioOptionBlockId: string): Promise<void> => {
    const uuid = uuidv4()
    await radioQuestionResponseCreate({
      variables: {
        input: {
          id: uuid,
          blockId: id,
          radioOptionBlockId
        }
      },
      optimisticResponse: {
        radioQuestionResponseCreate: {
          id: uuid,
          __typename: 'RadioQuestionResponse',
          radioOptionBlockId
        }
      }
    })
  }

  const selectedId = data?.radioQuestionResponseCreate?.radioOptionBlockId

  return (
    <Card data-testid="RadioQuestionCard">
      <CardContent>
        <Typography variant="h1" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h6">{description}</Typography>
      </CardContent>
      <CardContent>
        <ButtonGroup
          orientation="vertical"
          variant="contained"
          fullWidth={true}
        >
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
      </CardContent>
    </Card>
  )
}
