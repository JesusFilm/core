import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import { MouseEvent, ReactElement, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import EllipsisIcon from '@core/shared/ui/icons/Ellipsis'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import { DeleteBlock } from '../../../../Content/Canvas/QuickControls/DeleteBlock'
import { DuplicateBlock } from '../../../../Content/Canvas/QuickControls/DuplicateBlock'

interface StepBlockNodeMenuProps {
  step: TreeBlock<StepBlock>
  className?: string
}

export function StepBlockNodeMenu({
  step,
  className
}: StepBlockNodeMenuProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  function handleClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
  }

  return (
    <>
      <Fab
        variant="extended"
        className={className}
        id="edit-step"
        size="small"
        aria-controls={open ? 'edit-step-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        sx={{
          position: 'absolute',
          top: -20,
          right: -20
        }}
        data-testid="EditStepFab"
      >
        <EllipsisIcon />
      </Fab>
      <Menu
        id="edit-step-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        aria-labelledby="edit-step"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        data-testid="EditStepMenu"
      >
        <DuplicateBlock
          variant="list-item"
          block={step}
          handleClick={handleClose}
        />
        <DeleteBlock variant="list-item" block={step} closeMenu={handleClose} />
      </Menu>
    </>
  )
}
