import { ReactElement } from 'react'
import {
  Typography,
  Container,
  Card,
  CardContent,
  ButtonGroup
} from '@mui/material'
import { makeStyles, createStyles } from '@mui/styles'
import { RadioOption } from '../RadioOption'
import { GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { RadioQuestionVariant } from '../../../../__generated__/globalTypes'
import { useMutation, gql } from '@apollo/client'
import { RadioQuestionResponseCreate } from '../../../../__generated__/RadioQuestionResponseCreate'
import { v4 as uuidv4 } from 'uuid'

const useStyles = makeStyles(
  () =>
    createStyles({
      light: {
        background: '#ffffff'
      },
      dark: {
        background: '#3b3b3b',
        color: '#ffffff'
      }
    }),
  { name: 'MuiRadioQuestionComponent' }
)

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
  children,
  variant = RadioQuestionVariant.LIGHT
}: TreeBlock<RadioQuestionBlock>): ReactElement {
  const classes = useStyles()
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
    <Container maxWidth="sm">
      <Card
        data-testid="RadioQuestionCard"
        className={
          variant === RadioQuestionVariant.DARK ? classes.dark : classes.light
        }
      >
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
    </Container>
  )
}
