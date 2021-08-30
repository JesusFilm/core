import { ConductorContext } from '../../Conductor'
import { RadioOptionType, GoTo } from '../../../types'
import { Button, makeStyles } from '@material-ui/core'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { ReactElement, useState } from 'react'

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

export function RadioOption (block: RadioOptionType): ReactElement {
  const classes = useStyles()
  const [selectedOption, setSelectedOption] = useState<
  RadioOptionType | undefined
  >()

  // enables selected option to be highlighted
  const handleButtonSelect = (selected: RadioOptionType) => {
    setSelectedOption(selected)
  }

  return (
    <ConductorContext.Consumer>
      {({ goTo }: GoTo) => (
        <Button
          variant="contained"
          key={block.id}
          className={classes.buttonLabels}
          onClick={() => goTo(block.action != null ? block.action : undefined)}
          startIcon={
            selectedOption?.id === block.id
              ? (
              <CheckCircleIcon className={classes.highlightIcon} />
                )
              : (
              <RadioButtonUncheckedIcon />
                )
          }
        >
          {block.label}
        </Button>
      )}
    </ConductorContext.Consumer>
  )
}

export default RadioOption
