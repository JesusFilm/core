import { Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { ReactElement } from 'react'
import { compact } from 'lodash'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock, GetJourney_journey_blocks_RadioOptionBlock_action as Action } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { useBlocks } from '../../../libs/client/cache/blocks'

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

type RadioOptionProps = TreeBlock<RadioOptionBlock> & {
  className?: string
  selected?: boolean
  disabled?: boolean
  handleClick?: (selected: string) => void
}

export function RadioOption ({
  className,
  label,
  action,
  id,
  disabled = false,
  selected = false,
  handleClick: onClick
}: RadioOptionProps): ReactElement {
  const { setActiveBlockById } = useBlocks()
  const classes = useStyles()

  const handleClick = (): void => {
    if (action?.__typename === 'NavigateAction') {
      setActiveBlockById(action.blockId)
    }
    onClick?.(id)
  }

  return (
    <Button
      variant="contained"
      className={compact([className, classes.buttonLabels]).join(' ')}
      disabled={disabled}
      onClick={handleClick}
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
