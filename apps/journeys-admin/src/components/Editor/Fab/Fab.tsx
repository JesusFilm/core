import MuiFab, { type FabProps as MuiFabProps } from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import type { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import type { MouseEvent, ReactElement, ReactNode } from 'react'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import CheckContainedIcon from '@core/shared/ui/icons/CheckContained'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import type { BlockFields_CardBlock as CardBlock } from '../../../../__generated__/BlockFields'

interface FabProps {
  variant?: 'social' | 'mobile' | 'canvas'
}

export function Fab({ variant }: FabProps): ReactElement {
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
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'))

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
    if (activeCanvasDetailsDrawer === ActiveCanvasDetailsDrawer.AddBlock) {
      dispatch({
        type: 'SetActiveCanvasDetailsDrawerAction',
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
      })
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      if (!lgUp) {
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
      if (!lgUp) {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: ActiveSlide.Drawer
        })
      }
    }
  }
  function handleEditFab(event: MouseEvent): void {
    event.stopPropagation()
    if (
      activeSlide === ActiveSlide.JourneyFlow &&
      activeContent === ActiveContent.Canvas
    ) {
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
      })
    } else if (
      activeSlide === ActiveSlide.JourneyFlow &&
      activeContent === ActiveContent.Social
    ) {
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
  const videoBlock = cardBlock?.children?.find(
    (block) =>
      block.__typename === 'VideoBlock' && cardBlock.coverBlockId !== block.id
  )
  const disabled =
    steps == null ||
    (videoBlock != null && activeSlide !== ActiveSlide.JourneyFlow)

  // props default to save fab
  let props: MuiFabProps = {
    variant: lgUp ? 'extended' : 'circular',
    size: 'large',
    color: 'primary',
    disabled,
    sx: {
      position: { xs: 'absolute', md: 'relative' },
      bottom: { xs: 16, md: 'auto' },
      right: { xs: 16, md: 'auto' },
      fontWeight: 'bold'
    },
    onClick: handleSaveFab
  }
  // children default to save fab
  let children: ReactNode = (
    <>
      <CheckContainedIcon sx={{ mr: lgUp ? 3 : 0 }} />
      {lgUp ? t('Done') : ''}
    </>
  )

  const isEdit =
    activeFab === ActiveFab.Edit || activeSlide === ActiveSlide.JourneyFlow
  const isAdd = activeFab === ActiveFab.Add

  if (isEdit) {
    props = {
      ...props,
      onClick: handleEditFab
    }
    children = (
      <>
        <Edit2Icon sx={{ mr: lgUp ? 3 : 0 }} />
        {lgUp ? t('Edit') : ''}
      </>
    )
  } else if (isAdd) {
    props = {
      ...props,
      onClick: handleAddFab
    }
    children = (
      <>
        <Plus2Icon sx={{ mr: lgUp ? 3 : 0 }} />
        {lgUp && variant === 'canvas' && t('Add Block')}
      </>
    )
  }

  let fabIn = false
  switch (variant) {
    case 'mobile': {
      fabIn =
        !lgUp &&
        activeContent === ActiveContent.Canvas &&
        activeSlide === ActiveSlide.Content
      break
    }
    case 'canvas': {
      fabIn = lgUp && activeContent === ActiveContent.Canvas
      break
    }
    case 'social': {
      fabIn =
        activeSlide === ActiveSlide.JourneyFlow &&
        activeContent === ActiveContent.Social
      break
    }
    default:
      fabIn = false
  }

  return (
    <Zoom in={fabIn} unmountOnExit data-testid="Fab">
      <MuiFab {...props}>{children}</MuiFab>
    </Zoom>
  )
}
