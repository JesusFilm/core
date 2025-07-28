import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

export const StyledListRadioOption = styled(Button)<ButtonProps>(
  ({ theme }) => ({
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 400,
    lineHeight: theme.typography.body2.lineHeight,
    textAlign: 'start',
    justifyContent: 'flex-start',
    borderRadius: 'inherit',
    padding: '14px 10px 14px 14px',
    transition: theme.transitions.create(
      ['background-color', 'border-color', 'transform', 'box-shadow'],
      {
        duration: theme.transitions.duration.short
      }
    ),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.grey[200]}`,
    color: theme.palette.text.primary,
    opacity: 0.7,

    '&:hover': {
      backgroundColor: theme.palette.background.default,
      border: `1px solid ${theme.palette.grey[200]}`,
      transform: 'translateY(-2px)',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)'
    },

    '&.selected': {
      backgroundColor: theme.palette.primary.light,
      border: `1px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.contrastText,
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.2)'
    },
    '&.Mui-disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      border: `1px solid ${theme.palette.grey[200]}`,
      color: theme.palette.action.disabled,
      opacity: 0.6
    }
  })
)

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
                backgroundColor: (theme) => theme.palette.primary.contrastText
              },
              transform: 'translateY(0px) !important'
            }
          : undefined
      }
      data-testid="JourneysRadioOption"
    >
      {editableLabel ?? label}
    </StyledListRadioOption>
  )
}
