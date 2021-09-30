import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'
import { Icon } from '../../Icon'
import { ButtonFields } from '../../../../__generated__/ButtonFields'

export function Button({
  variant,
  label,
  color,
  size,
  startIcon,
  endIcon
}: ButtonFields): ReactElement {
  return (
    <MuiButton
      variant={variant ?? undefined}
      color={color ?? undefined}
      size={size ?? undefined}
      startIcon={
        startIcon != null && (
          <Icon
            __typename="Icon"
            name={startIcon.name}
            color={startIcon.color}
            size={startIcon.size}
          />
        )
      }
      endIcon={
        endIcon != null && (
          <Icon
            __typename="Icon"
            name={endIcon.name}
            color={endIcon.color}
            size={endIcon.size}
          />
        )
      }
    >
      {label}
    </MuiButton>
  )
}
