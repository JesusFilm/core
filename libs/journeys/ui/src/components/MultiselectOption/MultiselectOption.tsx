import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { MouseEvent, ReactElement } from 'react'

import type { TreeBlock } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'
import { getPollOptionBorderStyles } from '../MultiselectQuestion/utils/getPollOptionBorderStyles'

import { MultiselectOptionFields } from './__generated__/MultiselectOptionFields'

export const StyledListMultiselectOption = styled(Button)<ButtonProps>(({
  theme
}) => {
  const borderStyles = getPollOptionBorderStyles(theme, { important: true })

  return {
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 500,
    lineHeight: theme.typography.body2.lineHeight,
    textAlign: 'start',
    justifyContent: 'flex-start',
    borderRadius: '12px',
    padding: '14px 12px 14px 14px',
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
    color: theme.palette.mode === 'dark' ? '#EFEFEF' : '#444451',
    ...borderStyles,

    // Default state
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#26262E' : '#EFEFEF',

    // Hover state
    '&:hover': {
      ...borderStyles['&:hover'],
      backgroundColor: theme.palette.mode === 'dark' ? '#26262E' : '#DCDDE5',
      transform: 'translateY(-2px)',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 4px 12px rgba(0, 0, 0, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.12)'
    },

    // Selected state
    '&:active': {
      ...borderStyles['&:active'],
      backgroundColor: theme.palette.mode === 'dark' ? '#26262E' : '#444451',
      color: '#EFEFEF',
      boxShadow:
        theme.palette.mode === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px rgba(0, 0, 0, 0.18)'
    },

    // Disabled state
    '&.Mui-disabled': {
      ...borderStyles['&.disabled'],
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(38, 38, 46, 0.5)'
          : 'rgba(239, 239, 239, 0.6)',
      color:
        theme.palette.mode === 'dark'
          ? 'rgba(239, 239, 239, 0.6)'
          : 'rgba(68, 68, 81, 0.6)'
    }
  }
})

export interface MultiselectOptionProps
  extends TreeBlock<MultiselectOptionFields> {
  selected?: boolean
  disabled?: boolean
  onClick?: (selectedId: string, selectedLabel: string) => void
  editableLabel?: ReactElement
}

export function MultiselectOption({
  label,
  id,
  disabled = false,
  selected = false,
  onClick,
  editableLabel
}: MultiselectOptionProps): ReactElement {
  const { journey } = useJourney()

  const handleClick = (e: MouseEvent): void => {
    e.stopPropagation()
    onClick?.(id, label)
  }

  return (
    <StyledListMultiselectOption
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
      data-testid="JourneysMultiselectOptionList"
    >
      {editableLabel ?? label}
    </StyledListMultiselectOption>
  )
}
