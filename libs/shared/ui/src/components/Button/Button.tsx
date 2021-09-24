import { ReactElement } from 'react'
import { Button as MuiButton, CircularProgress } from '@mui/material'
import { Icon } from '../Icon/'
import { ButtonBlockFields } from './__generated__/ButtonBlockFields'

export interface ButtonProps extends ButtonBlockFields {
  loading?: boolean
  disabled?: boolean
}

export function Button({
  variant,
  label,
  color,
  size,
  startIcon,
  endIcon,
  loading,
  disabled
}: ButtonProps): ReactElement {
  return (
    <MuiButton
      variant={variant ?? undefined}
      disabled={disabled}
      color={color ?? undefined}
      size={size ?? undefined}
      startIcon={
        startIcon?.name !== undefined ? (
          <Icon
            __typename="Icon"
            name={startIcon?.name}
            color={startIcon?.color}
            size={startIcon?.size}
          />
        ) : null
      }
      endIcon={
        endIcon?.name !== undefined ? (
          <Icon
            __typename="Icon"
            name={endIcon?.name}
            color={endIcon?.color}
            size={endIcon?.size}
          />
        ) : null
      }
    >
      {loading === false ? <CircularProgress color="secondary" /> : label}
    </MuiButton>
  )
}
