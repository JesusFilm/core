import MuiFab, { FabProps } from '@mui/material/Fab'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Zoom from '@mui/material/Zoom'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { BlockFields_CardBlock as CardBlock } from '../../../../__generated__/BlockFields'
import { DRAWER_WIDTH } from '../constants'

export function Fab(): ReactElement {
  const {
    state: {
      activeFab,
      activeCanvasDetailsDrawer,
      selectedStep,
      steps,
      activeSlide,
      activeContent
    },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  function handleAddFab(): void {
    if (activeCanvasDetailsDrawer === ActiveCanvasDetailsDrawer.AddBlock) {
      dispatch({
        type: 'SetActiveCanvasDetailsDrawerAction',
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
      })
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      if (!smUp) {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: ActiveSlide.Content
        })
      }
    } else {
      dispatch({
        type: 'SetActiveCanvasDetailsDrawerAction',
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock
      })
      if (!smUp) {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: ActiveSlide.Drawer
        })
      }
    }
  }
  function handleEditFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
  }
  function handleSaveFab(): void {
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Edit })
  }

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const props: FabProps = {
    variant: smUp ? 'extended' : 'circular',
    size: 'large',
    color: 'primary',
    disabled:
      steps == null ||
      cardBlock?.children?.find(
        (block) =>
          block.__typename === 'VideoBlock' &&
          cardBlock.coverBlockId !== block.id
      ) != null,
    sx: {
      position: 'absolute',
      bottom: { xs: 16, sm: 73 },
      right: { xs: 16, sm: DRAWER_WIDTH + 84 }
    }
  }

  return (
    <Zoom
      in={
        activeContent === ActiveContent.Canvas &&
        activeSlide === ActiveSlide.Content
      }
      unmountOnExit
      data-testid="Fab"
    >
      {activeFab === ActiveFab.Add ? (
        <MuiFab {...props} onClick={handleAddFab}>
          <Plus2Icon sx={{ mr: smUp ? 3 : 0 }} />
          {smUp ? t('Add') : ''}
        </MuiFab>
      ) : activeFab === ActiveFab.Edit ? (
        <MuiFab {...props} onClick={handleEditFab}>
          <Edit2Icon sx={{ mr: smUp ? 3 : 0 }} />
          {smUp ? t('Edit') : ''}
        </MuiFab>
      ) : (
        <MuiFab {...props} onClick={handleSaveFab}>
          <CheckContainedIcon sx={{ mr: smUp ? 3 : 0 }} />
          {smUp ? t('Done') : ''}
        </MuiFab>
      )}
    </Zoom>
  )
}
