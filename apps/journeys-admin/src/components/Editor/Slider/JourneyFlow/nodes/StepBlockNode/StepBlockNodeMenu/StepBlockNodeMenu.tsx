import { gql, useMutation } from '@apollo/client'
import Fab from '@mui/material/Fab'
import Menu from '@mui/material/Menu'
import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { MouseEvent, ReactElement, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'
import EllipsisIcon from '@core/shared/ui/icons/Ellipsis'

import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import { StepDuplicate } from '../../../../../../../../__generated__/StepDuplicate'
import { MenuItem } from '../../../../../../MenuItem'
import { DeleteBlock } from '../../../../Content/Canvas/QuickControls/DeleteBlock'

export const STEP_DUPLICATE = gql`
  mutation StepDuplicate(
    $id: ID!
    $journeyId: ID!
    $parentOrder: Int
    $x: Int
    $y: Int
  ) {
    blockDuplicate(
      id: $id
      journeyId: $journeyId
      parentOrder: $parentOrder
      x: $x
      y: $y
    ) {
      id
    }
  }
`

interface StepBlockNodeMenuProps {
  step: TreeBlock<StepBlock>
  xPos?: number
  yPos?: number
  className?: string
}

export function StepBlockNodeMenu({
  step,
  xPos,
  yPos,
  className
}: StepBlockNodeMenuProps): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const [stepDuplicate] = useMutation<StepDuplicate>(STEP_DUPLICATE)
  const { enqueueSnackbar } = useSnackbar()
  const { dispatch } = useEditor()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  function handleClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
  }

  function handleDuplicateStep(): void {
    if (journey == null || step == null) return
    // duplicate step
    const { data } = stepDuplicate({
      variables: {
        id: step.id,
        journeyId: journey.id,
        parentOrder: null,
        x: xPos != null ? xPos + 40 : null,
        y: yPos != null ? yPos + 40 : null
      },
      update(cache, { data }) {
        if (data?.blockDuplicate != null) {
          const lastStep = last(
            data.blockDuplicate.filter(
              (block) => block.__typename === 'StepBlock'
            )
          )

          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const duplicatedBlockRef = cache.writeFragment({
                  data: lastStep,
                  fragment: gql`
                    fragment DuplicatedBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, duplicatedBlockRef]
              }
            }
          })

          cache.modify({
            fields: {
              blocks(existingBlockRefs = []) {
                const newStepBlockRef = cache.writeFragment({
                  data: lastStep,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, newStepBlockRef]
              }
            }
          })
        }
      }
    })

    if (data?.blockDuplicate != null) {
      const stepBlocks = transformer(
        data.stepDuplicate as BlockFields[]
      ) as Array<TreeBlock<StepBlock>>
      const steps = stepBlocks.filter(
        (block) => block.__typename === 'StepBlock'
      )
      const duplicatedStep = last(steps)
      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep: duplicatedStep
      })
    }

    enqueueSnackbar(t('Card Duplicated}'), {
      variant: 'success',
      preventDuplicate: true
    })

    handleClose()
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
          top: -14,
          right: -20,
          height: '28px',
          color: 'rgba(0, 0, 0, 0.5)'
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
        data-testid="StepBlockNodeMenu"
      >
        <MenuItem
          label={t('Duplicate Card')}
          icon={<CopyLeftIcon color="inherit" />}
          disabled={step == null}
          onMouseUp={handleDuplicateStep}
          testId="Duplicate-Card"
        />
        <DeleteBlock variant="list-item" block={step} closeMenu={handleClose} />
      </Menu>
    </>
  )
}
