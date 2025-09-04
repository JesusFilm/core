import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import Zoom from '@mui/material/Zoom'
import { MouseEvent, ReactElement, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { isIOSTouchScreen } from '@core/shared/ui/deviceUtils'
import EllipsisIcon from '@core/shared/ui/icons/Ellipsis'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../__generated__/BlockFields'
import { DeleteBlock } from '../../../../Content/Canvas/QuickControls/DeleteBlock'

import { DuplicateStep } from './DuplicateStep'

interface StepBlockNodeMenuProps {
  step: TreeBlock<StepBlock>
  xPos?: number
  yPos?: number
  className?: string
  in?: boolean
}

export function StepBlockNodeMenu({
  step,
  xPos,
  yPos,
  className,
  in: appear
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
      <Zoom in={appear}>
        <Fab
          variant="extended"
          className={className}
          // id should match target.id in onNodeDragStop function of apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx
          id="edit-step"
          size="small"
          aria-controls={open ? 'edit-step-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{
            position: 'absolute',
            top: -14,
            right: -20,
            height: '28px',
            color: 'rgba(0, 0, 0, 0.5)'
          }}
          data-testid="EditStepFab"
        >
          <EllipsisIcon
            // id should match target.id in onNodeDragStop function of apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx
            id="StepBlockNodeMenuIcon"
            data-testid="EditStepFabIcon"
          />
        </Fab>
      </Zoom>
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
        data-testid="StepBlockNodeMenu"
      >
        <DuplicateStep
          step={step}
          xPos={xPos}
          yPos={yPos}
          handleClick={handleClose}
        />
        <DeleteBlock variant="list-item" block={step} closeMenu={handleClose} />
      </Menu>
    </>
  )
}
