import { ReactElement } from 'react'
import { Button as MuiButton, CircularProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Icon } from '../Icon/'
import { ButtonBlockFields } from './__generated__/ButtonBlockFields'

const useStyles = makeStyles(() => ({
  spacing: {
    margin: '5px 0'
  }
}))

export interface ButtonProps extends ButtonBlockFields {
  loading?: boolean
  disabled?: boolean
}

export function Button(props: ButtonProps): ReactElement {
  const classes = useStyles()

  return (
    <MuiButton
      data-testid='ButtonComponent'
      className={classes.spacing}
      variant={props.variant}
      color={props.color}
      size={props.size}
      startIcon={props.startIcon?.name !== null ? <Icon icon={props.startIcon?.name} /> : null}
      endIcon={props.endIcon?.name !== null ? <Icon icon={props.endIcon?.name} /> : null}>
      {props.loading === false ? <CircularProgress color="secondary" /> : props.label}
    </MuiButton>
  )
}
