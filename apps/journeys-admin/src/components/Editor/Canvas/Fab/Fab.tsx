import MuiFab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../__generated__/GetJourney'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { Drawer } from '../../Drawer'
import { AddBlockDrawer } from '../../AddBlockDrawer'
import { TreeBlock } from '@core/journeys/ui/block'

interface FabProps {
  disabled?: boolean
  visible?: boolean
}

export function Fab({ disabled, visible = true }: FabProps): ReactElement {
  const {
    state: { activeFab, selectedStep },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [open, setOpen] = useState(false)

  function toggleOpen(): void {
    setOpen(!open)
  }
  function handleEditFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
  }
  function handleSaveFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
  }

  const fabStyles = {
    position: 'absolute',
    bottom: { xs: 16, sm: 64 },
    right: { xs: 16, sm: 424 }
  }

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const hasVideoBlock =
    cardBlock?.children?.find(
      (block) =>
        block.__typename === 'VideoBlock' && cardBlock.coverBlockId !== block.id
    ) != null

  const hasChildBlock = cardBlock?.children?.some(
    (block) => block.id !== cardBlock.coverBlockId
  )

  return (
    <>
      <Zoom in={!hasVideoBlock && visible} unmountOnExit data-testid="Fab">
        {activeFab === ActiveFab.Add ? (
          <MuiFab
            variant={smUp ? 'extended' : 'circular'}
            size="large"
            color="primary"
            onClick={toggleOpen}
            disabled={disabled || hasVideoBlock}
            sx={fabStyles}
          >
            <Plus2Icon sx={{ mr: smUp ? 3 : 0 }} />
            {smUp ? t('Add') : ''}
          </MuiFab>
        ) : activeFab === ActiveFab.Edit ? (
          <MuiFab
            variant={smUp ? 'extended' : 'circular'}
            size="large"
            color="primary"
            onClick={handleEditFab}
            disabled={disabled || hasVideoBlock}
            sx={fabStyles}
          >
            <Edit2Icon sx={{ mr: smUp ? 3 : 0 }} />
            {smUp ? t('Edit') : ''}
          </MuiFab>
        ) : (
          <MuiFab
            variant={smUp ? 'extended' : 'circular'}
            size="large"
            color="primary"
            onClick={handleSaveFab}
            disabled={disabled || hasVideoBlock}
            sx={fabStyles}
          >
            <CheckContainedIcon sx={{ mr: smUp ? 3 : 0 }} />
            {smUp ? t('Done') : ''}
          </MuiFab>
        )}
      </Zoom>
      <Drawer title={'Add new blocks'} open={open} onClose={toggleOpen}>
        <AddBlockDrawer hasVideo={hasVideoBlock} hasBlock={hasChildBlock} />
      </Drawer>
    </>
  )
}
