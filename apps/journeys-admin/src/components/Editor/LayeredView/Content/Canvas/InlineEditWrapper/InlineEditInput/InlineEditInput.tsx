import InputBase, { InputBaseProps } from '@mui/material/InputBase'
import { SimplePaletteColorOptions, styled } from '@mui/material/styles'

import { isIOSTouchScreen as checkIsIOSTouchScreen } from '@core/shared/ui/deviceUtils'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

interface StyledInputProps extends InputBaseProps {}

const adminPrimaryColor = adminTheme.palette
  .primary as SimplePaletteColorOptions

export const InlineEditInput = styled(InputBase)<StyledInputProps>(() => {
  const isIOSTouchScreen = checkIsIOSTouchScreen()
  return {
    '& .MuiInputBase-input': {
      textAlign: 'inherit',
      textTransform: 'inherit'
    },
    color: 'inherit',
    fontSize: isIOSTouchScreen ? '1rem' : 'inherit',
    fontWeight: 'inherit',
    fontFamily: 'inherit',
    lineHeight: 'inherit',
    letterSpacing: 'inherit',
    padding: '0px',
    caretColor: adminPrimaryColor.main
  }
})
