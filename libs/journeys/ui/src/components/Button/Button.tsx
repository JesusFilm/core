import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import MuiButton from '@mui/material/Button'
import { handleAction, TreeBlock } from '../..'
import { IconFields } from '../Icon/__generated__/IconFields'
import { Icon } from '../Icon'
import { ButtonFields } from './__generated__/ButtonFields'

export interface ButtonProps extends TreeBlock<ButtonFields> {
  editableLabel?: ReactElement
}

export function Button({
  buttonVariant,
  label,
  buttonColor,
  size,
  startIconId,
  endIconId,
  action,
  children,
  editableLabel
}: ButtonProps): ReactElement {
  const startIcon = children.find((block) => block.id === startIconId) as
    | TreeBlock<IconFields>
    | undefined

  const endIcon = children.find((block) => block.id === endIconId) as
    | TreeBlock<IconFields>
    | undefined

  const router = useRouter()
  const handleClick = (): void => {
    handleAction(router, action)
  }

  return (
    <MuiButton
      variant={buttonVariant ?? 'contained'}
      color={buttonColor ?? undefined}
      size={size ?? undefined}
      startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
      endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
      onClick={handleClick}
      fullWidth
    >
      {editableLabel ?? label}
    </MuiButton>
  )
}
