import { Button, useTheme } from '@mui/material'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { ReactElement } from 'react'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { handleAction } from '../../../libs/action'

type RadioOptionProps = TreeBlock<RadioOptionBlock> & {
  className?: string
  selected?: boolean
  disabled?: boolean
  onClick?: (selected: string) => void
}

export function RadioOption({
  className,
  label,
  action,
  id,
  disabled = false,
  selected = false,
  onClick
}: RadioOptionProps): ReactElement {
  const theme = useTheme()

  const handleClick = (): void => {
    handleAction(action)
    onClick?.(id)
  }

  return (
    <Button
      variant="contained"
      className={className}
      disabled={disabled}
      onClick={handleClick}
      startIcon={
        selected ? (
          <CheckCircleIcon data-testid="RadioOptionCheckCircleIcon" />
        ) : (
          <RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />
        )
      }
      sx={{
        fontFamily: theme.typography.body2.fontFamily,
        fontSize: theme.typography.body2.fontSize,
        fontWeight: 600,
        lineHeight: theme.typography.body2.lineHeight,
        textAlign: 'start',
        justifyContent: 'flex-start',
        borderRadius: '8px',
        padding: '14px 10px 14px 14px'
      }}
    >
      {label}
    </Button>
  )
}

export default RadioOption
