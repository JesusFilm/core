import { ReactElement } from 'react'
import { Button as MuiButton, CircularProgress } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Icon } from '../Icon/'
import { ButtonBlockFields } from './__generated__/ButtonBlockFields'

const useStyles = makeStyles(() => ({
  spacing: {
    margin: '5px 0',
    borderRadius: 13
  }
}))

export interface ButtonProps extends ButtonBlockFields {
  loading?: boolean
  disabled?: boolean
}

export function Button({ variant, label, color, size, startIcon, endIcon, loading, disabled }: ButtonProps): ReactElement {
  const classes = useStyles()

  return (
    <MuiButton
      data-testid='ButtonComponent'
      className={classes.spacing}
      variant={variant ?? undefined}
      disabled={disabled}
      color={color ?? undefined}
      size={size ?? undefined}
      startIcon={startIcon?.name !== undefined ? <Icon __typename='Icon' name={startIcon?.name} color={startIcon?.color} fontSize={startIcon?.fontSize} /> : null}
      endIcon={endIcon?.name !== undefined ? <Icon __typename='Icon' name={endIcon?.name} color={endIcon?.color} fontSize={endIcon?.fontSize} /> : null}>
      {loading === false ? <CircularProgress color="secondary" /> : label}
    </MuiButton>
  )
}
