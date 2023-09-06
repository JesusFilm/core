import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { WrappersProps } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { StyledRadioOption } from '@core/journeys/ui/RadioOption'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'
import AddSquare4 from '@core/shared/ui/icons/AddSquare4'

import { RadioOptionBlockCreate } from '../../../../../../__generated__/RadioOptionBlockCreate'
import { RadioQuestionFields } from '../../../../../../__generated__/RadioQuestionFields'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

export const RADIO_OPTION_BLOCK_CREATE = gql`
  mutation RadioOptionBlockCreate($input: RadioOptionBlockCreateInput!) {
    radioOptionBlockCreate(input: $input) {
      id
      label
    }
  }
`

interface RadioQuestionEditProps extends TreeBlock<RadioQuestionFields> {
  wrappers?: WrappersProps
}

export function RadioQuestionEdit({
  id,
  wrappers,
  ...props
}: RadioQuestionEditProps): ReactElement {
  const [radioOptionBlockCreate] = useMutation<RadioOptionBlockCreate>(
    RADIO_OPTION_BLOCK_CREATE
  )
  const { journey } = useJourney()

  const handleCreateOption = async (): Promise<void> => {
    if (journey == null) return

    await radioOptionBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          parentBlockId: id,
          label: ''
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
    // Box mimics wrappers on RadioOptions so all ButtonGroup children have same type for class styling
    <Box>
      <StyledRadioOption
        data-testid={`${id}-add-option`}
        variant="contained"
        fullWidth
        disableRipple
        startIcon={<AddSquare4 sx={{ color: `${adminPrimaryColor.main}` }} />}
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
      addOption={props.children.length < 12 ? addRadioOption : undefined}
      wrappers={wrappers}
    />
  )
}
