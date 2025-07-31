import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { MouseEvent, ReactElement } from 'react'

import { handleAction } from '../../libs/action'
import type { TreeBlock } from '../../libs/block'
import { getNextStepSlug } from '../../libs/getNextStepSlug'
import { useJourney } from '../../libs/JourneyProvider'
import { getPollOptionBorderStyles } from '../RadioQuestion/utils/getPollOptionBorderStyles'

import { RadioOptionFields } from './__generated__/RadioOptionFields'

interface RadioOptionProps extends TreeBlock<RadioOptionFields> {
  selected?: boolean
  disabled?: boolean
  onClick?: (selectedId: string, selectedLabel: string) => void
  editableLabel?: ReactElement
}

export const StyledRadioOption = styled(Button)<ButtonProps>(({ theme }) => {
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
    '&:active': {
      ...borderStyles['&:active'],
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
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[0 as keyof typeof theme.palette.grey]
                    : theme.palette.grey[900]
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
