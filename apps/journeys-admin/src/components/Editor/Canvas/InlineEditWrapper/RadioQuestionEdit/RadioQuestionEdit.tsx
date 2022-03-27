import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import { RadioQuestion, StyledRadioOption, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { RadioQuestionBlockUpdateContent } from '../../../../../../__generated__/RadioQuestionBlockUpdateContent'
import { RadioOptionBlockCreate } from '../../../../../../__generated__/RadioOptionBlockCreate'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'
import { InlineEditInput } from '../InlineEditInput'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

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

export const RADIO_OPTION_BLOCK_CREATE = gql`
  mutation RadioOptionBlockCreate($input: RadioOptionBlockCreateInput!) {
    radioOptionBlockCreate(input: $input) {
      id
      label
    }
  }
`

interface RadioQuestionEditProps extends TreeBlock<RadioQuestionFields> {}

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
  const [radioOptionBlockCreate] = useMutation<RadioOptionBlockCreate>(
    RADIO_OPTION_BLOCK_CREATE
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

  const handleCreateOption = async (): Promise<void> => {
    await radioOptionBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          parentBlockId: id,
          label: `Option ${props.children.length + 1}`
        }
      },
      update(cache, { data }) {
        if (data?.radioOptionBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const newBlockRef = cache.writeFragment({
                  data: data.radioOptionBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, newBlockRef]
              }
            }
          })
        }
      }
    })
  }

  const labelInput = (
    <InlineEditInput
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
    <InlineEditInput
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

  const addRadioOption = (
    <StyledRadioOption
      id={`${id}-add-option`}
      variant="contained"
      fullWidth
      disableRipple
      startIcon={
        <AddCircleRoundedIcon sx={{ color: `${adminPrimaryColor.main}` }} />
      }
      onClick={handleCreateOption}
    >
      Add New Option
    </StyledRadioOption>
  )

  return (
    <RadioQuestion
      {...props}
      id={id}
      label={label}
      description={description}
      editableLabel={labelInput}
      editableDescription={descriptionInput}
      addOption={props.children.length < 12 ? addRadioOption : undefined}
    />
  )
}
