import { ReactElement } from 'react'
import { Button as MuiButton, CircularProgress } from '@mui/material'
import { CheckCircle, PlayArrow, Translate, RadioButtonUnchecked, FormatQuote, LockOpen, ArrowForward, ChatBubbleOutline, LiveTv, MenuBook } from '@mui/icons-material'
import { makeStyles } from '@mui/styles'
import { ButtonType } from './buttonTypes'

const useStyles = makeStyles(() => ({
  spacing: {
    margin: '5px 0'
  }
}))

export interface ButtonProps extends ButtonType {
  loading?: boolean
  disabled?: boolean
}

export function Button (props: ButtonProps): ReactElement {
  const classes = useStyles()

  const setIcon = (icon: string | undefined): ReactElement | null => {
    switch (icon) {
      case 'checkCircle':
        return <CheckCircle />
      case 'playArrow':
        return <PlayArrow />
      case 'translate':
        return <Translate />
      case 'radioButtonUnchecked':
        return <RadioButtonUnchecked />
      case 'formatQuote':
        return <FormatQuote />
      case 'lockOpen':
        return <LockOpen />
      case 'arrowForward':
        return <ArrowForward />
      case 'chatBubbleOutline':
        return <ChatBubbleOutline />
      case 'liveTv':
        return <LiveTv />
      case 'menuBook':
        return <MenuBook />
      default:
        return null
    }
  }

  return (
    <MuiButton {...props}
    className={classes.spacing}
    startIcon={props.startIcon?.icon !== null ? setIcon(props.startIcon?.icon) : null}
    endIcon={props.endIcon?.icon !== null ? setIcon(props.endIcon?.icon) : null}>
        {props.label === '' ? <CircularProgress color="secondary" /> : props.label}
    </MuiButton>
  )
}
