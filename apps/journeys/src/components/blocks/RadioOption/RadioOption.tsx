import { RadioOptionType } from '../../../types'
import { Button, makeStyles } from '@material-ui/core'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
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
  selected: boolean
  disabled: boolean
  handleClick?: (selected: string, action: string | undefined) => void
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
      onClick={() => handleClick(id, action)}
      startIcon={
        selected && !disabled
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
