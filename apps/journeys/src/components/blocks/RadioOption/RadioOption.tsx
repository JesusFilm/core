import { RadioOptionType } from '../../../types'
import { Button, makeStyles } from '@material-ui/core'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { ReactElement, useState } from 'react'
import { compact } from 'lodash'
import { useAppDispatch } from '../../../libs/store/store'
import { navigate } from '../../Conductor/conductorSlice'

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
  className?: string
}

export function RadioOption ({ className, label, action }: RadioOptionProps): ReactElement {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [selected, setSelected] = useState(false)

  const handleClick = (): void => {
    setSelected(true)
    dispatch(navigate(action))
  }

  if (selected) {
    return <Button
      variant="contained"
      className={compact([className, classes.buttonLabels]).join(' ')}
      startIcon={<CheckCircleIcon data-testid="RadioOptionCheckCircleIcon" className={classes.highlightIcon} />}
    >
      {label}
    </Button>
  } else {
    return (
      <Button
      variant="contained"
      className={compact([className, classes.buttonLabels]).join(' ')}
      onClick={handleClick}
      startIcon={<RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />}
    >
        {label}
      </Button>
    )
  }
}

export default RadioOption
