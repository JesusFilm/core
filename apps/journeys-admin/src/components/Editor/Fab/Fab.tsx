import MuiFab, { FabProps } from '@mui/material/Fab'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Zoom from '@mui/material/Zoom'
import { MouseEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveContent,
  ActiveFab,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { BlockFields_CardBlock as CardBlock } from '../../../../__generated__/BlockFields'

interface fabProp {
  variant?: 'social' | 'mobile' | 'canvas'
}

export function Fab({ variant }: fabProp): ReactElement {
  const {
    state: {
      activeFab,
      selectedComponent,
      selectedStep,
      steps,
      activeSlide,
      activeContent
    },
    dispatch
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  if (activeContent == null) {
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Canvas
    })
  }

  function handleAddFab(event: MouseEvent): void {
    event.stopPropagation()
    if (activeSlide !== ActiveSlide.Content) {
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.Content
      })
    }
    if (selectedComponent === 'AddBlock') {
      dispatch({
        type: 'SetSelectedComponentAction'
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
        type: 'SetSelectedComponentAction',
        selectedComponent: 'AddBlock'
      })
      if (!smUp) {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: ActiveSlide.Drawer
        })
      }
    }
  }
  function handleEditFab(event: MouseEvent): void {
    event.stopPropagation()
    if (activeSlide === ActiveSlide.JourneyFlow) {
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.Content
      })
    } else {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Save })
    }
  }
  function handleSaveFab(event: MouseEvent): void {
    event.stopPropagation()
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
      (cardBlock?.children?.find(
        (block) =>
          block.__typename === 'VideoBlock' &&
          cardBlock.coverBlockId !== block.id
      ) != null &&
        activeSlide !== ActiveSlide.JourneyFlow),
    sx: {
      position: { xs: 'absolute', sm: 'relative' },
      bottom: { xs: 16, sm: 'auto' },
      right: { xs: 16, sm: 'auto' },
      fontWeight: 'bold'
    }
  }

  return (
    <Zoom
      in={
        variant === 'mobile'
          ? !smUp &&
            activeContent === ActiveContent.Canvas &&
            activeSlide === ActiveSlide.Content
          : variant === 'canvas'
          ? smUp && activeContent === ActiveContent.Canvas
          : activeSlide === ActiveSlide.JourneyFlow &&
            activeContent === ActiveContent.Social
      }
      unmountOnExit
      data-testid="Fab"
    >
      {activeFab === ActiveFab.Edit ||
      activeSlide === ActiveSlide.JourneyFlow ? (
        <MuiFab {...props} onClick={handleEditFab}>
          <Edit2Icon sx={{ mr: smUp ? 3 : 0 }} />
          {smUp ? t('Edit') : ''}
        </MuiFab>
      ) : activeFab === ActiveFab.Add ? (
        <MuiFab {...props} onClick={handleAddFab}>
          <Plus2Icon sx={{ mr: smUp ? 3 : 0 }} />
          {smUp ? t(variant === 'canvas' ? 'Add Block' : 'Add') : ''}
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
