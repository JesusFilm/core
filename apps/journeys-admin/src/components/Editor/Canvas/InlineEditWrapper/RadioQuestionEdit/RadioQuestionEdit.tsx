import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { styled, SimplePaletteColorOptions } from '@mui/material/styles'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { RadioQuestion, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'
import { RadioQuestionBlockUpdateContent } from '../../../../../../__generated__/RadioQuestionBlockUpdateContent'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'

export const RADIO_QUESTION_BLOCK_UPDATE_CONTENT = gql`
  mutation RadioQuestionBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: RadioQuestionBlockUpdateInput!
  ) {
    radioQuestionBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      label
      description
    }
  }
`
interface RadioQuestionEditProps extends TreeBlock<RadioQuestionFields> {}

interface StyledInputProps extends InputBaseProps {}

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

const StyledInput = styled(InputBase)<StyledInputProps>(() => ({
  '& .MuiInputBase-input': {
    textAlign: 'inherit',
    textTransform: 'inherit'
  },
  color: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  padding: 0,
  caretColor: adminPrimaryColor.main
}))

export function RadioQuestionEdit({
  id,
  label,
  description,
  ...props
}: RadioQuestionEditProps): ReactElement {
  const [radioQuestionBlockUpdate] =
    useMutation<RadioQuestionBlockUpdateContent>(
      RADIO_QUESTION_BLOCK_UPDATE_CONTENT
    )

  const journey = useJourney()
  const [labelValue, setLabel] = useState(label)
  const [descriptionValue, setDescription] = useState(description)

  async function handleSaveBlock(): Promise<void> {
    const label = labelValue.trimStart().trimEnd()
    const description = descriptionValue?.trimStart().trimEnd() ?? null
    await radioQuestionBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { label, description }
      },
      optimisticResponse: {
        radioQuestionBlockUpdate: {
          id,
          __typename: 'RadioQuestionBlock',
          label,
          description
        }
      }
    })
  }

  const labelInput = (
    <StyledInput
      name={`edit-heading-${id}`}
      multiline
      fullWidth
      autoFocus
      value={labelValue}
      placeholder="Type your question here..."
      onBlur={handleSaveBlock}
      onChange={(e) => {
        setLabel(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  const descriptionInput = (
    <StyledInput
      name={`edit-description-${id}`}
      multiline
      fullWidth
      value={descriptionValue}
      placeholder="Type your description here..."
      onBlur={handleSaveBlock}
      onChange={(e) => {
        setDescription(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <RadioQuestion
      {...props}
      id={id}
      label={label}
      description={description}
      editableLabel={labelInput}
      editableDescription={descriptionInput}
    />
  )
}
