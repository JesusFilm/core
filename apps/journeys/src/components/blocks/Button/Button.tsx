import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Icon } from '../Icon'
import { ButtonFields } from '../../../../__generated__/ButtonFields'

export interface ButtonProps extends ButtonFields {
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
  if (loading === false) {
    return (
      <LoadingButton loading variant={variant ?? undefined}>
        {label}
      </LoadingButton>
    )
  } else {
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
        {label}
      </MuiButton>
    )
  }
}
