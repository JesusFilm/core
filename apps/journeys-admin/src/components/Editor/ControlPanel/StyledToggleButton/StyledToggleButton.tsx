import { styled } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import { palette } from '../../../ThemeProvider/admin/tokens/colors'

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  textTransform: 'none',
  backgroundColor: palette[0],
  backgroundClip: 'padding-box',
  color: palette[900],
  '&:first-of-type': {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  '&:last-of-type': {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  '&.Mui-selected': {
    backgroundColor: palette[100]
  },
  '&.hover': {
    backgroundColor: palette[200]
  }
}))
