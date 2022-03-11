import { ReactElement, MouseEvent } from 'react'
import { useRouter } from 'next/router'
import { SxProps } from '@mui/system/styleFunctionSx'
import MuiButton from '@mui/material/Button'
import { handleAction, TreeBlock, useEditor, ActiveTab, ActiveFab } from '../..'
import { IconFields } from '../Icon/__generated__/IconFields'
import { Icon } from '../Icon'
import { ButtonFields } from './__generated__/ButtonFields'

interface ButtonProps extends TreeBlock<ButtonFields> {
  editableLabel?: ReactElement
  sx?: SxProps
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
  sx,
  editableLabel,
  ...props
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

    if (selectedBlock?.id === block.id) {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
    } else {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
      dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Properties })
      dispatch({ type: 'SetSelectedBlockAction', block })
      dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
    }
  }

  return (
    <MuiButton
      variant={buttonVariant ?? 'contained'}
      color={buttonColor ?? undefined}
      size={size ?? undefined}
      startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
      endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
      sx={{
        ...sx,
        outline: selectedBlock?.id === props.id ? '3px solid #C52D3A' : 'none',
        outlineOffset: '5px'
      }}
      onClick={selectedBlock === undefined ? handleClick : handleSelectBlock}
      fullWidth
    >
      {editableLabel ?? label}
    </MuiButton>
  )
}
