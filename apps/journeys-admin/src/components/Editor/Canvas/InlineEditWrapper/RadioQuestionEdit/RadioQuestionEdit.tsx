import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'
import Box from '@mui/material/Box'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import { RadioQuestion, StyledRadioOption, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { RadioOptionBlockCreate } from '../../../../../../__generated__/RadioOptionBlockCreate'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'
import { SelectableWrapper } from '../../SelectableWrapper'
import { InlineEditWrapper } from '../InlineEditWrapper'

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

export interface RadioQuestionEditProps
  extends TreeBlock<RadioQuestionFields> {}

export function RadioQuestionEdit({
  id,
  label,
  description,
  ...props
}: RadioQuestionEditProps): ReactElement {
  const [radioOptionBlockCreate] = useMutation<RadioOptionBlockCreate>(
    RADIO_OPTION_BLOCK_CREATE
  )
  const journey = useJourney()

  const handleCreateOption = async (): Promise<void> => {
    if (journey == null) return

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

  const addRadioOption = (
    <Box className="MuiButtonGroup-root MuiButtonGroup-grouped MuiButtonGroup-groupedVertical">
      <StyledRadioOption
        id={`${id}-add-option`}
        variant="contained"
        fullWidth
        disableRipple
        startIcon={
          <AddCircleRoundedIcon sx={{ color: `${adminPrimaryColor.main}` }} />
        }
        onClick={handleCreateOption}
        sx={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}
      >
        Add New Option
      </StyledRadioOption>
    </Box>
  )

  return (
    <RadioQuestion
      {...props}
      id={id}
      label={label}
      description={description}
      addOption={props.children.length < 12 ? addRadioOption : undefined}
      wrappers={{
        Wrapper: SelectableWrapper,
        RadioOptionWrapper: InlineEditWrapper
      }}
    />
  )
}
