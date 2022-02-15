import { ReactElement, MouseEvent } from 'react'
import { useRouter } from 'next/router'
import MuiButton from '@mui/material/Button'
import { handleAction, TreeBlock, useEditor, ActiveTab } from '../..'
import { IconFields } from '../Icon/__generated__/IconFields'
import { Icon } from '../Icon'
import { ButtonFields } from './__generated__/ButtonFields'

export function Button({
  buttonVariant,
  label,
  buttonColor,
  size,
  startIconId,
  endIconId,
  action,
  children,
  ...props
}: TreeBlock<ButtonFields>): ReactElement {
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

  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  const handleSelectBlock = (e: MouseEvent<HTMLElement>): void => {
    e.stopPropagation()

    const block: TreeBlock<ButtonFields> = {
      buttonVariant,
      label,
      buttonColor,
      size,
      startIconId,
      endIconId,
      action,
      children,
      ...props
    }

    dispatch({ type: 'SetSelectedBlockAction', block })
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Properties })
    dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
  }

  return (
    <MuiButton
      variant={buttonVariant ?? 'contained'}
      color={buttonColor ?? undefined}
      size={size ?? undefined}
      startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
      endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
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
