import Button, { ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { MouseEvent, ReactElement } from 'react'
import { useTheme } from '@mui/material/styles'

import type { TreeBlock } from '../../libs/block'
import { useJourney } from '../../libs/JourneyProvider'
import { getPollOptionBorderStyles } from '../MultiselectQuestion/utils/getPollOptionBorderStyles'

import { MultiselectOptionFields } from './__generated__/MultiselectOptionFields'
import CheckSquareContainedIcon from '@core/shared/ui/icons/CheckSquareContained'
import SquareIcon from '@core/shared/ui/icons/Square'

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
    borderRadius: 0,
    padding: '14px 20px',
    transition: theme.transitions.create(
      ['background-color', 'border-color', 'opacity', 'color'],
      {
        duration: theme.transitions.duration.short
      }
    ),
    wordBreak: 'break-word',
    color: theme.palette.mode === 'dark' ? '#EFEFEF' : '#444451',
    ...borderStyles,

    // Default state
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFF99' : '#00000099',

    // Hover state
    '&:hover': {
      ...borderStyles['&:hover'],
      // Dark mode hover visually matches default per spec
      backgroundColor: theme.palette.mode === 'dark' ? '#FFFFFFCC' : '#000000CC'
    },

    // Selected state (persistent)
    '&.selected': {
      backgroundColor:
        theme.palette.mode === 'dark' ? '#FFFFFFE5' : '#000000E5',
      color: theme.palette.mode === 'dark' ? '#1D1D1D' : '#FFFFFF'
    },
    '&.selected:hover': {
      // backgroundColor: theme.palette.mode === 'dark' ? '#0C0C0F' : '#FFFFFF'
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
  const theme = useTheme()

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
      startIcon={
        selected ? (
          <CheckSquareContainedIcon
            sx={{
              color: theme.palette.mode === 'dark' ? '#1D1D1D' : '#FFFFFF',
              fontSize: 22
            }}
          />
        ) : (
          <SquareIcon
            sx={{
              color: theme.palette.mode === 'dark' ? '#6D6D7D' : '#AAACBB',
              fontSize: 22
            }}
          />
        )
      }
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
