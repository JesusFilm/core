import { ConductorContext } from '../../Conductor'
import { RadioOptionType, GoTo } from '../../../types'
import {
  Button,
  makeStyles
} from '@material-ui/core'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import { ReactElement } from 'react'

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
  return (
    <ConductorContext.Consumer>
      {({ goTo }: GoTo) => (
        <Button
          variant="contained"
          key={block.id}
          className={classes.buttonLabels}
          onClick={() => goTo((block.action != null) ? block.action : undefined)}
          startIcon={<RadioButtonUncheckedIcon />}
        >
          {block.label}
        </Button>
      )}
    </ConductorContext.Consumer>
  )
}

export default RadioOption
