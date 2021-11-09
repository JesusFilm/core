import { ReactElement } from 'react'
import { Button as MuiButton } from '@mui/material'
import { Icon } from '../../Icon'
import { ButtonFields } from '../../../../__generated__/ButtonFields'
import { handleAction } from '../../../libs/action'
import { useRouter } from 'next/router'

export function Button({
  buttonVariant,
  label,
  buttonColor,
  size,
  startIcon,
  endIcon,
  action
}: ButtonFields): ReactElement {
  const router = useRouter()
  const handleClick = (): void => {
    handleAction(router, action)
  }

  return (
    <MuiButton
      variant={buttonVariant ?? 'contained'}
      color={buttonColor ?? undefined}
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
      onClick={handleClick}
      fullWidth
    >
      {label}
    </MuiButton>
  )
}
