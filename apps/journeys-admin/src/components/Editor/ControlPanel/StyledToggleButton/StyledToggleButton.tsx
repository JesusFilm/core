import { styled } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import { palette } from '../../../ThemeProvider/admin/tokens/colors'

export const StyledToggleButton = styled(ToggleButton)(() => ({
  textTransform: 'none',
  backgroundColor: palette[0], // 'primary.contastText'
  backgroundClip: 'padding-box',
  color: palette[900], // 'secondary.dark'
  '&:first-of-type': {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  '&:last-of-type': {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12
  },
  '&.Mui-selected': {
    backgroundColor: palette[100] // 'background.default'
  },
  '&.hover': {
    backgroundColor: palette[200] // 'divider'
  }
}))
