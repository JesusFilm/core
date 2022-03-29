import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { styled, SimplePaletteColorOptions } from '@mui/material/styles'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { RadioOption, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'
import { RadioOptionBlockUpdateContent } from '../../../../../../__generated__/RadioOptionBlockUpdateContent'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'

export const RADIO_OPTION_BLOCK_UPDATE_CONTENT = gql`
  mutation RadioOptionBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: RadioOptionBlockUpdateInput!
  ) {
    radioOptionBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      label
    }
  }
`
interface RadioOptionEditProps extends TreeBlock<RadioOptionFields> {}

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
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  padding: '0px',
  caretColor: adminPrimaryColor.main
}))

export function RadioOptionEdit({
  id,
  label,
  ...radioOptionProps
}: RadioOptionEditProps): ReactElement {
  const [radioOptionBlockUpdate] = useMutation<RadioOptionBlockUpdateContent>(
    RADIO_OPTION_BLOCK_UPDATE_CONTENT
  )
  const journey = useJourney()
  const [value, setValue] = useState(label)

  async function handleSaveBlock(): Promise<void> {
    const label = value.trim().replace(/\n/g, '')
    await radioOptionBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { label }
      },
      optimisticResponse: {
        radioOptionBlockUpdate: {
          id,
          __typename: 'RadioOptionBlock',
          label
        }
      }
    })
  }

  const input = (
    <StyledInput
      name={`edit-${id}`}
      fullWidth
      multiline
      autoFocus
      value={value}
      onBlur={handleSaveBlock}
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <RadioOption
      {...radioOptionProps}
      id={id}
      label={label}
      editableLabel={input}
    />
  )
}
