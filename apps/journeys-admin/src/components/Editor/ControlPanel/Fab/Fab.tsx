import MuiFab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { Drawer } from '../../Drawer'
import { AddBlockDrawer } from '../../AddBlockDrawer'

interface FabProp {
  visible?: boolean
  onAddClick: () => void
  disabled?: boolean
}

export function Fab({ visible, onAddClick, disabled }: FabProp): ReactElement {
  const {
    state: { activeFab, activeSlide },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [open, setOpen] = useState(false)

  function toggleOpen(): void {
    if (smUp) {
      setOpen(!open)
    }
  }
  function handleEditFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
  }
  function handleSaveFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
  }

  const fabStyles = {
    position: 'absolute',
    bottom: { xs: 16, sm: 48 },
    right: { xs: 16, sm: activeSlide === ActiveSlide.Content ? 424 : 24 }
  }

  return (
    <>
      <Zoom in={visible} unmountOnExit data-testid="Fab">
        {activeFab === ActiveFab.Add ? (
          <MuiFab
            variant={smUp ? 'extended' : 'circular'}
            size="large"
            color="primary"
            onClick={toggleOpen}
            disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
            sx={fabStyles}
          >
            <CheckContainedIcon sx={{ mr: smUp ? 3 : 0 }} />
            {smUp ? t('Done') : ''}
          </MuiFab>
        )}
      </Zoom>
      <Drawer title={'Add new blocks'} open={open} onClose={toggleOpen}>
        <AddBlockDrawer />
      </Drawer>
    </>
  )
}
