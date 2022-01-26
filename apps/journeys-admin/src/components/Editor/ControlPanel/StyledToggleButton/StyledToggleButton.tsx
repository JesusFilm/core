import { styled } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import { palette } from '../../../ThemeProvider/admin/tokens/colors'

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  textTransform: 'none',
  backgroundColor: palette[0],
  backgroundClip: 'padding-box',
  color: theme.palette.secondary.dark,
  '&:first-of-type': {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  '&:last-of-type': {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.background.default
  },
  '&.hover': {
    backgroundColor: palette[200]
  }
}))
