import { ReactElement } from 'react'
import { Button as MuiButton, CircularProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { ButtonType } from './buttonTypes'
import { Icon } from '../Icon/'

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

  return (
    <MuiButton {...props}
    data-testid='ButtonComponent'
    className={classes.spacing}
    startIcon={props.startIcon?.icon !== null ? <Icon icon={props.startIcon?.icon} /> : null}
    endIcon={props.endIcon?.icon !== null ? <Icon icon={props.endIcon?.icon} /> : null}>
        {props.loading === false ? <CircularProgress color="secondary" /> : props.label}
    </MuiButton>
  )
}
