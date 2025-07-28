import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'

const StyledGridRadioOption = styled(Button)<ButtonProps>(({ theme }) => ({
  fontFamily: theme.typography.button.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: 400,
  lineHeight: theme.typography.body2.lineHeight,
  textAlign: 'start',
  justifyContent: 'flex-start',
  borderRadius: 'inherit',
  padding: '14px 10px 14px 14px',
  height: '100%',
  minHeight: '80px'
}))

interface GridVariantProps {
  label: string
  selected?: boolean
  disabled?: boolean
  handleClick: (e: React.MouseEvent) => void
  editableLabel?: ReactElement
}

export function GridVariant({
  label,
  selected = false,
  disabled = false,
  handleClick,
  editableLabel
}: GridVariantProps): ReactElement {
  return (
    <StyledGridRadioOption
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
    </StyledGridRadioOption>
  )
}
