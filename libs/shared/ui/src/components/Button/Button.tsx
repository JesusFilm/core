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

export function Button ({ variant, label, color, size, startIcon, endIcon, loading }: ButtonProps): ReactElement {
  const classes = useStyles()

  return (
    <MuiButton
      data-testid='ButtonComponent'
      className={classes.spacing}
      variant={variant ?? undefined}
      color={color ?? undefined}
      size={size ?? undefined}
      startIcon={startIcon?.name !== null ? <Icon icon={startIcon?.name} /> : null}
      endIcon={endIcon?.name !== null ? <Icon icon={endIcon?.name} /> : null}>
      {loading === false ? <CircularProgress color="secondary" /> : label}
    </MuiButton>
  )
}
