import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { styled, SimplePaletteColorOptions } from '@mui/material/styles'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { Typography, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../libs/context'
import { adminTheme } from '../../../../ThemeProvider/admin/theme'
import { TypographyBlockUpdateContent } from '../../../../../../__generated__/TypographyBlockUpdateContent'
import { TypographyFields } from '../../../../../../__generated__/TypographyFields'

export const TYPOGRAPHY_BLOCK_UPDATE_CONTENT = gql`
  mutation TypographyBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: TypographyBlockUpdateInput!
  ) {
    typographyBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      content
    }
  }
`
interface TypographyEditProps extends TreeBlock<TypographyFields> {}

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
  lineHeight: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  padding: 0,
  caretColor: adminPrimaryColor.main
}))

export function TypographyEdit({
  id,
  variant,
  align,
  color,
  content,
  ...props
}: TypographyEditProps): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateContent>(
    TYPOGRAPHY_BLOCK_UPDATE_CONTENT
  )

  const journey = useJourney()
  const [value, setValue] = useState(content)

  async function handleSaveBlock(): Promise<void> {
    const content = value.trimStart().trimEnd()
    await typographyBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { content }
      },
      optimisticResponse: {
        typographyBlockUpdate: {
          id,
          __typename: 'TypographyBlock',
          content
        }
      }
    })
  }

  const input = (
    <StyledInput
      name={`edit-${id}`}
      multiline
      fullWidth
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
    <Typography
      {...props}
      id={id}
      variant={variant}
      align={align}
      color={color}
      content={content}
      editableContent={input}
    />
  )
}
