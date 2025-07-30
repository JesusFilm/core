import { Theme } from '@mui/material/styles'

export const getPollOptionBorderStyles = (
  theme: Theme,
  options?: { important?: boolean }
) => ({
  borderColor:
    theme.palette.mode === 'dark'
      ? `rgba(150, 150, 150, 0.2)${options?.important ? ' !important' : ''}`
      : `rgba(225, 225, 225, 0.3)${options?.important ? ' !important' : ''}`,
  borderWidth: `1px${options?.important ? ' !important' : ''}`,
  borderStyle: `solid${options?.important ? ' !important' : ''}`,
  '&:hover': {
    borderColor:
      theme.palette.mode === 'dark'
        ? `rgba(150, 150, 150, 0.5)${options?.important ? ' !important' : ''}`
        : `rgba(255, 255, 255, 0.5)${options?.important ? ' !important' : ''}`
  },
  '&.selected': {
    borderColor:
      theme.palette.mode === 'dark'
        ? `rgba(150, 150, 150, 0.7)${options?.important ? '!important' : ''}`
        : `rgba(255, 255, 255, 0.7)${options?.important ? '!important' : ''}`
  },
  '&.disabled': {
    borderColor:
      theme.palette.mode === 'dark'
        ? `rgba(150, 150, 150, 0.15)${options?.important ? '!important' : ''}`
        : `rgba(255, 255, 255, 0.15)${options?.important ? '!important' : ''}`
  }
})
