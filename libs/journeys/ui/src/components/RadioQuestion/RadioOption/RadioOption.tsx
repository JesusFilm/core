import { ReactElement } from 'react'
import { useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useRouter } from 'next/router'
import { TreeBlock, handleAction } from '../../..'
import { RadioOptionFields } from './__generated__/RadioOptionFields'
import { handleAction, TreeBlock } from '../../../libs'

export interface RadioOptionProps extends TreeBlock<RadioOptionFields> {
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
  const router = useRouter()

  const handleClick = (): void => {
    handleAction(router, action)
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
