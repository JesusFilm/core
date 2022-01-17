import { ReactElement, useContext, MouseEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Box from '@mui/material/Box'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'
import { useMutation, gql } from '@apollo/client'
import { TreeBlock, EditorContext } from '../..'
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

export function RadioQuestion({
  id: blockId,
  label,
  description,
  children,
  uuid = uuidv4,
  ...props
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

  const {
    state: { selectedBlock },
    dispatch
  } = useContext(EditorContext)

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    const block: TreeBlock<RadioQuestionFields> = {
      id: blockId,
      label,
      description,
      children,
      ...props
    }

    dispatch({ type: 'SetSelectedBlockAction', block })
  }

  return (
    <Box
      data-testid={`radioQuestion-${blockId}`}
      sx={{
        outline: selectedBlock?.id === blockId ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px'
      }}
      onClick={selectedBlock !== undefined ? handleSelectBlock : undefined}
    >
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
    </Box>
  )
}
