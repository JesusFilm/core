import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

import { getPollOptionBorderStyles } from '../../RadioQuestion/utils/getPollOptionBorderStyles'

export const StyledListRadioOption = styled(Button)<ButtonProps>(({
  theme
}) => {
  const borderStyles = getPollOptionBorderStyles(theme, { important: true })

  return {
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 400,
    lineHeight: theme.typography.body2.lineHeight,
    textAlign: 'start',
    justifyContent: 'flex-start',
    borderRadius: '12px',
    padding: '14px 10px 14px 14px',
    transition: theme.transitions.create(
      [
        'background-color',
        'border-color',
        'transform',
        'box-shadow',
        'opacity'
      ],
      {
        duration: theme.transitions.duration.short
      }
    ),
    wordBreak: 'break-word',
    color: 'text.primary',
    ...borderStyles,

    // Default state
    opacity: theme.palette.mode === 'dark' ? 1 : 0.7,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(0, 0, 0, 0.6)',

    // Hover state
    '&:hover': {
      ...borderStyles['&:hover'],
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(0, 0, 0, 0.8)',
      transform: 'translateY(-2px)',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)'
    },

    // Selected state
    '&.selected': {
      ...borderStyles['&.selected'],
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(0, 0, 0, 0.9)',
      color:
        theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.9)'
          : 'rgba(255, 255, 255, 0.95)',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.2)'
    },

    // Disabled state
    '&.Mui-disabled': {
      ...borderStyles['&.disabled'],
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.4)'
          : 'rgba(0, 0, 0, 0.4)',
      color:
        theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.5)'
          : 'rgba(255, 255, 255, 0.7)'
    }
  }
})

interface ListVariantProps {
  label: string
  selected?: boolean
  disabled?: boolean
  handleClick: (e: React.MouseEvent) => void
  editableLabel?: ReactElement
}

export function ListVariant({
  label,
  selected = false,
  disabled = false,
  handleClick,
  editableLabel
}: ListVariantProps): ReactElement {
  return (
    <StyledListRadioOption
      variant="contained"
      disabled={disabled}
      onClick={handleClick}
      fullWidth
      disableRipple
      className={selected ? 'selected' : ''}
      sx={
        editableLabel != null
          ? {
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[0 as keyof typeof theme.palette.grey]
                    : theme.palette.grey[900]
              },
              transform: 'translateY(0px) !important'
            }
          : undefined
      }
      data-testid="JourneysRadioOptionList"
    >
      {editableLabel ?? label}
    </StyledListRadioOption>
  )
}
