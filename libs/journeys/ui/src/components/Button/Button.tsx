import { ReactElement, MouseEvent } from 'react'
import { useRouter } from 'next/router'
import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import { handleAction, TreeBlock, useEditor, ActiveTab, ActiveFab } from '../..'
import { ButtonVariant } from '../../../__generated__/globalTypes'
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
    // Margin added via Box so it's ignored by admin selection border outline
    <Box
      sx={{
        mb: 4,
        mt:
          size === 'large'
            ? 6
            : size === 'medium'
            ? 5
            : size === 'small'
            ? 4
            : 5
      }}
    >
      <MuiButton
        variant={buttonVariant ?? ButtonVariant.contained}
        color={buttonColor ?? undefined}
        size={size ?? undefined}
        startIcon={startIcon != null ? <Icon {...startIcon} /> : undefined}
        endIcon={endIcon != null ? <Icon {...endIcon} /> : undefined}
        sx={{
          outline:
            selectedBlock?.id === props.id ? '3px solid #C52D3A' : 'none',
          outlineOffset: '5px',
          '&:hover':
            editableLabel != null
              ? {
                  backgroundColor:
                    buttonVariant === ButtonVariant.text
                      ? 'transparent'
                      : `${buttonColor ?? 'primary'}.main`
                }
              : undefined
        }}
        onClick={selectedBlock === undefined ? handleClick : handleSelectBlock}
        fullWidth
      >
        {editableLabel ?? label}
      </MuiButton>
    </Box>
  )
}
