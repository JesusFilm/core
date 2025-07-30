import { Theme } from '@mui/material/styles'

export const getPollOptionBorderStyles = (theme: Theme) => ({
  borderColor:
    theme.palette.mode === 'dark'
      ? 'rgba(150, 150, 150, 0.2)'
      : 'rgba(225, 225, 225, 0.3)',
  borderWidth: '1px ',
  borderStyle: 'solid',
  '&:hover': {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(150, 150, 150, 0.5)'
        : 'rgba(255, 255, 255, 0.5)'
  },
  '&.selected': {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(150, 150, 150, 0.7)'
        : 'rgba(255, 255, 255, 0.7)'
  },
  '&.disabled': {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(150, 150, 150, 0.15)'
        : 'rgba(255, 255, 255, 0.15)'
  }
})
