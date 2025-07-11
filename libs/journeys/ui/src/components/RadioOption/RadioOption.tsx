import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
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
      startIcon={
        selected ? (
          <CheckCircleIcon data-testid="RadioOptionCheckCircleIcon" />
        ) : (
          <RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />
        )
      }
      sx={
        editableLabel != null
          ? {
              '&:hover': {
                backgroundColor: 'primary.main'
              }
            }
          : undefined
      }
      data-testid="JourneysRadioOption"
    >
      {editableLabel ?? label}
    </StyledRadioOption>
  )
}
