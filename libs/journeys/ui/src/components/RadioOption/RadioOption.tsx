import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { MouseEvent, ReactElement } from 'react'

import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { useJourney } from '../../libs/JourneyProvider'

import { RadioOptionFields } from './__generated__/RadioOptionFields'

interface RadioOptionProps extends TreeBlock<RadioOptionFields> {
  selected?: boolean
  disabled?: boolean
  onClick?: (selectedId: string, selectedLabel: string) => void
  editableLabel?: ReactElement
}

export const StyledRadioOption = styled(Button)<ButtonProps>(({ theme }) => ({
  fontFamily: theme.typography.button.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: 400,
  lineHeight: theme.typography.body2.lineHeight,
  textAlign: 'start',
  justifyContent: 'flex-start',
  borderRadius: 'inherit',
  padding: '14px 10px 14px 14px',
  transition: theme.transitions.create(
    ['background-color', 'border-color', 'transform', 'box-shadow', 'opacity'],
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
        : '0 4px 12px rgba(0, 0, 0, 0.15)',
    opacity: 0.9
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
    opacity: 0.4,
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.grey[200]}`,
    color: theme.palette.action.disabled
  }
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
  const { journey } = useJourney()
  const router = useRouter()

  const handleClick = (e: MouseEvent): void => {
    e.stopPropagation()
    onClick?.(id, label)
    const nextStepSlug = getNextStepSlug(journey, action)
    handleAction(router, action, nextStepSlug)
  }

  return (
    <StyledRadioOption
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
    </StyledRadioOption>
  )
}
