import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { styled, SimplePaletteColorOptions } from '@mui/material/styles'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { Button, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'
import { ButtonBlockUpdateContent } from '../../../../../../__generated__/ButtonBlockUpdateContent'
import { ButtonFields } from '../../../../../../__generated__/ButtonFields'
import { ButtonVariant } from '../../../../../../__generated__/globalTypes'

export const BUTTON_BLOCK_UPDATE_CONTENT = gql`
  mutation ButtonBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: ButtonBlockUpdateInput!
  ) {
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      label
    }
  }
`
interface ButtonEditProps extends TreeBlock<ButtonFields> {}

interface StyledInputProps
  extends InputBaseProps,
    Pick<TreeBlock<ButtonFields>, 'buttonVariant' | 'buttonColor'> {}

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

const StyledInput = styled(InputBase)<StyledInputProps>(() => ({
  '& .MuiInputBase-input': {
    textAlign: 'inherit'
  },
  color: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  padding: '0px',
  caretColor: adminPrimaryColor.main
}))

export function ButtonEdit({
  id,
  buttonVariant,
  buttonColor,
  label,
  ...buttonProps
}: ButtonEditProps): ReactElement {
  const [buttonBlockUpdate] = useMutation<ButtonBlockUpdateContent>(
    BUTTON_BLOCK_UPDATE_CONTENT
  )

  const journey = useJourney()
  const [value, setValue] = useState(label)

  async function handleSaveBlock(): Promise<void> {
    const label = value.trim().replace(/\n/g, '')
    await buttonBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { label }
      },
      optimisticResponse: {
        buttonBlockUpdate: {
          id,
          __typename: 'ButtonBlock',
          label
        }
      }
    })
  }

  const input = (
    <StyledInput
      name={`edit-${id}`}
      buttonVariant={buttonVariant}
      buttonColor={buttonColor}
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
    <Button
      {...buttonProps}
      id={id}
      buttonVariant={buttonVariant}
      buttonColor={buttonColor}
      label={label}
      editableLabel={input}
      sx={{
        '&:hover': {
          backgroundColor:
            buttonVariant === ButtonVariant.text
              ? 'transparent'
              : `${buttonColor ?? 'primary'}.main`
        }
      }}
    />
  )
}
