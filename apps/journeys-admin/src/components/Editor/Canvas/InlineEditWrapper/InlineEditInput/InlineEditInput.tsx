import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'

import { adminTheme } from '../../../../ThemeProvider/admin/theme'

interface StyledInputProps extends InputBaseProps {}

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

export const InlineEditInput = styled(InputBase)<StyledInputProps>(() => ({
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
  padding: '0px',
  caretColor: adminPrimaryColor.main
}))
