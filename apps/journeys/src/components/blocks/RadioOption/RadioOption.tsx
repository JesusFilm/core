import { Button } from '@mui/material'
import { makeStyles } from '@mui/styles'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { ReactElement } from 'react'
import { compact } from 'lodash'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { handleAction } from '../../../libs/action'

const useStyles = makeStyles(() => ({
  highlightIcon: {
    color: '#54A055'
  },
  buttonLabels: {
    fontWeight: 600,
    lineHeight: 1.4,
    textAlign: 'start',
    justifyContent: 'flex-start',
    borderRadius: '8px',
    padding: '14px 10px 14px 14px'
  }
}))

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
  const classes = useStyles()

  const handleClick = (): void => {
    handleAction(action)
    onClick?.(id)
  }

  return (
    <Button
      variant="contained"
      className={compact([className, classes.buttonLabels]).join(' ')}
      disabled={disabled}
      onClick={handleClick}
      startIcon={
        selected ? (
          <CheckCircleIcon
            data-testid="RadioOptionCheckCircleIcon"
            className={classes.highlightIcon}
          />
        ) : (
          <RadioButtonUncheckedIcon data-testid="RadioOptionRadioButtonUncheckedIcon" />
        )
      }
    >
      {label}
    </Button>
  )
}

export default RadioOption
