import { ReactElement } from 'react'
import { styled } from '@mui/material/styles'
import Button, { ButtonProps } from '@mui/material/Button'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useRouter } from 'next/router'
import type { TreeBlock } from '../../libs/block'
import { handleAction } from '../../libs/action'
import { RadioOptionFields } from './__generated__/RadioOptionFields'

interface RadioOptionProps extends TreeBlock<RadioOptionFields> {
  selected?: boolean
  disabled?: boolean
  onClick?: (selectedId: string, selectedLabel: string) => void
  editableLabel?: ReactElement
}

export const StyledRadioOption = styled(Button)<ButtonProps>(({ theme }) => ({
  fontFamily: theme.typography.body2.fontFamily,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: 600,
  lineHeight: theme.typography.body2.lineHeight,
  textAlign: 'start',
  justifyContent: 'flex-start',
  borderRadius: 'inherit',
  padding: '14px 10px 14px 14px'
}))

export function RadioOption({
  label,
  action,
  id,
  disabled = false,
  selected = false,
  onClick,
  editableLabel
}: RadioOptionProps): ReactElement {
  const router = useRouter()

  const handleClick = (): void => {
    onClick?.(id, label)
    handleAction(router, action)
  }

  const hoverStyling =
    editableLabel != null
      ? {
          '&:hover': {
            backgroundColor: 'primary.main'
          }
        }
      : {}

  return (
    <StyledRadioOption
      variant="contained"
      disabled={disabled}
      onClick={handleClick}
      fullWidth
      disableRipple
      startIcon={
        selected ? (
          <CheckCircleIcon data-testid="RadioOptionCheckCircleIcon" />
        ) : (
          <RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />
        )
      }
      sx={{
        pointerEvents: 'all',
        ...hoverStyling
      }}
    >
      {editableLabel ?? label}
    </StyledRadioOption>
  )
}
