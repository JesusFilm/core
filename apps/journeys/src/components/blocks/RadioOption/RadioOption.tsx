import { RadioOptionType } from '../../../types'
import { Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { ReactElement } from 'react'
import { compact } from 'lodash'

const useStyles = makeStyles(() => ({
  highlightIcon: {
    color: '#54A055'
  },
  buttonLabels: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.4,
    textTransform: 'none',
    textAlign: 'start',
    justifyContent: 'flex-start'
  },
  light: {
    background: '#ffffff'
  },
  dark: {
    background: '#3b3b3b',
    color: '#ffffff'
  }
}))

type RadioOptionProps = RadioOptionType & {
  id: string
  className?: string
  selected?: boolean
  disabled?: boolean
  handleClick?: (selected: string, action?: string) => void
}

export function RadioOption ({
  className,
  label,
  action,
  id,
  disabled = false,
  selected = false,
  handleClick
}: RadioOptionProps): ReactElement {
  const classes = useStyles()

  return (
    <Button
      variant="contained"
      className={compact([className, classes.buttonLabels]).join(' ')}
      disabled={disabled}
      onClick={() => {
        if (handleClick !== undefined) {
          handleClick(id, action)
        }
      }}
      startIcon={
        selected
          ? (
            <CheckCircleIcon
            data-testid="RadioOptionCheckCircleIcon"
            className={classes.highlightIcon}
          />
            )
          : (
            <RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />
            )
      }
    >
      {label}
    </Button>
  )
}

export default RadioOption
