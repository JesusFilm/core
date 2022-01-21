import { ReactElement, useContext, MouseEvent } from 'react'
import { useRouter } from 'next/router'
import MuiButton from '@mui/material/Button'
import { Icon } from '../Icon'
import { handleAction, TreeBlock, EditorContext } from '../..'
import { ButtonFields } from './__generated__/ButtonFields'

export function Button({
  buttonVariant,
  label,
  buttonColor,
  size,
  startIcon,
  endIcon,
  action,
  ...props
}: TreeBlock<ButtonFields>): ReactElement {
  const router = useRouter()
  const handleClick = (): void => {
    handleAction(router, action)
  }

  const {
    state: { selectedBlock },
    dispatch
  } = useContext(EditorContext)

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    const block: TreeBlock<ButtonFields> = {
      buttonVariant,
      label,
      buttonColor,
      size,
      startIcon,
      endIcon,
      action,
      ...props
    }

    dispatch({ type: 'SetSelectedBlockAction', block })
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
      sx={{
        outline: selectedBlock?.id === props.id ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px'
      }}
      onClick={selectedBlock === undefined ? handleClick : handleSelectBlock}
      fullWidth
    >
      {label}
    </MuiButton>
  )
}
