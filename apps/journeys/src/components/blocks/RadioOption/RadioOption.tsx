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
  selectedId: string | undefined
  handleClick?: (selected: string, action: any) => void
}

export function RadioOption ({
  className,
  label,
  action,
  id,
  selectedId,
  handleClick
}: RadioOptionProps): ReactElement {
  const classes = useStyles()

  if (selectedId === id) {
    return (
      <Button
        variant="contained"
        className={compact([className, classes.buttonLabels]).join(' ')}
        startIcon={
          <CheckCircleIcon
            data-testid="RadioOptionCheckCircleIcon"
            className={classes.highlightIcon}
          />
        }
      >
        {label}
      </Button>
    )
  } else {
    return (
      <Button
        variant="contained"
        className={compact([className, classes.buttonLabels]).join(' ')}
        disabled={selectedId !== id && !!selectedId}
        onClick={() => handleClick(id, action)}
        startIcon={
          <RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />
        }
      >
        {label}
      </Button>
    )
  }
}

export default RadioOption
