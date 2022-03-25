import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { styled, SimplePaletteColorOptions } from '@mui/material/styles'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { SignUp, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'
import { SignUpBlockUpdateContent } from '../../../../../../__generated__/SignUpBlockUpdateContent'
import { SignUpFields } from '../../../../../../__generated__/SignUpFields'

export const SIGN_UP_BLOCK_UPDATE_CONTENT = gql`
  mutation SignUpBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: SignUpBlockUpdateInput!
  ) {
    signUpBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      submitLabel
    }
  }
`
interface SignUpEditProps extends TreeBlock<SignUpFields> {}

interface StyledInputProps extends InputBaseProps {}

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

const StyledInput = styled(InputBase)<StyledInputProps>(() => ({
  '& .MuiInputBase-input': {
    textAlign: 'inherit'
  },
  color: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  fontFamily: 'inherit',
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  padding: '0px',
  caretColor: adminPrimaryColor.main
}))

export function SignUpEdit({
  id,
  submitLabel,
  ...signUpProps
}: SignUpEditProps): ReactElement {
  const [signUpBlockUpdate] = useMutation<SignUpBlockUpdateContent>(
    SIGN_UP_BLOCK_UPDATE_CONTENT
  )

  const journey = useJourney()
  const [value, setValue] = useState(submitLabel ?? '')

  async function handleSaveBlock(): Promise<void> {
    const submitLabel = value.trim().replace(/\n/g, '')
    await signUpBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { submitLabel }
      },
      optimisticResponse: {
        signUpBlockUpdate: {
          id,
          __typename: 'SignUpBlock',
          submitLabel
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
    <SignUp
      {...signUpProps}
      id={id}
      submitLabel={submitLabel}
      editableSubmitLabel={input}
      sx={{
        '&:hover': {
          backgroundColor: 'primary.main'
        }
      }}
    />
  )
}
