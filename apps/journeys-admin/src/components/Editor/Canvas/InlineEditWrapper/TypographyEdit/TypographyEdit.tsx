import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { styled, SimplePaletteColorOptions } from '@mui/material/styles'
import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { TreeBlock, useEditor } from '@core/journeys/ui'
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
interface TypographyEditProps
  extends Pick<
    TreeBlock<TypographyFields>,
    'id' | 'variant' | 'align' | 'color' | 'content'
  > {}

interface StyledInputProps
  extends InputBaseProps,
    Pick<TreeBlock<TypographyFields>, 'variant' | 'align'> {}

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

const StyledInput = styled(InputBase)<StyledInputProps>(
  ({ variant, align, color, theme }) => ({
    '& .MuiInputBase-input': {
      ...theme.components?.MuiTypography,
      ...theme.typography[variant ?? 'body1'],
      marginBottom: 0,
      // TODO: Use locale alignment as default
      textAlign: align ?? 'left',
      color:
        color != null ? theme.palette[color].main : theme.palette.primary.main
    },
    marginBottom: 16,
    ...theme.typography[variant ?? 'body1'],
    '&:last-child': {
      marginBottom: 0
    },
    padding: 0,
    caretColor: adminPrimaryColor.main
  })
)

export function TypographyEdit({
  id,
  variant,
  align,
  color,
  content
}: TypographyEditProps): ReactElement {
  const [typographyBlockUpdate] = useMutation<TypographyBlockUpdateContent>(
    TYPOGRAPHY_BLOCK_UPDATE_CONTENT
  )
  const {
    state: { selectedBlock }
  } = useEditor()
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

  return (
    <StyledInput
      name={`edit-${id}`}
      variant={variant}
      align={align}
      color={color ?? 'primary'}
      multiline
      fullWidth
      autoFocus
      sx={{
        outline:
          selectedBlock?.id === id
            ? `3px solid ${adminPrimaryColor.main}`
            : 'none',
        outlineOffset: '5px'
      }}
      value={value}
      onBlur={handleSaveBlock}
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )
}
