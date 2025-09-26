import { Theme } from '@mui/material/styles'

export const getPollOptionBorderStyles = (
  theme: Theme,
  options?: { important?: boolean }
) => {
  // Figma tokens
  const figmaBorderLight = '#DCDDE5' // Shades/200
  const figmaBorderDark = '#6D6D7D' // Editor/Secondary/Light

  const borderColor =
    theme.palette.mode === 'dark' ? figmaBorderDark : figmaBorderLight

  return {
    borderColor: `${borderColor}${options?.important ? ' !important' : ''}`,
    borderWidth: `1px${options?.important ? ' !important' : ''}`,
    borderStyle: `solid${options?.important ? ' !important' : ''}`,
    '&:hover': {
      borderColor: `${borderColor}${options?.important ? ' !important' : ''}`
    },
    '&:active': {
      borderColor: `${borderColor}${options?.important ? '!important' : ''}`
    },
    '&.disabled': {
      borderColor: `${borderColor}${options?.important ? '!important' : ''}`
    }
  }
}
