import MuiFab, { FabProps as MuiFabProps } from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, ReactNode } from 'react'

import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { BlockFields_CardBlock as CardBlock } from '../../../../__generated__/BlockFields'

interface FabProps {
  variant?: 'social' | 'mobile' | 'canvas'
}

export function Fab({ variant }: FabProps): ReactElement {
  const {
    state: {
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
      dispatch({
        type: 'SetActiveCanvasDetailsDrawerAction',
        activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock
      })
    } else if (
      activeCanvasDetailsDrawer === ActiveCanvasDetailsDrawer.AddBlock
    ) {
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

  const props: MuiFabProps = {
    variant: smUp ? 'extended' : 'circular',
    size: 'large',
    color: 'primary',
    disabled,
    sx: {
      position: { xs: 'absolute', sm: 'relative' },
      bottom: { xs: 16, sm: 'auto' },
      right: { xs: 16, sm: 'auto' },
      fontWeight: 'bold'
    },
    onClick: handleAddFab
  }

  const children: ReactNode = (
    <>
      <Plus2Icon sx={{ mr: smUp ? 3 : 0 }} />
      {smUp ? t('Add Block') : ''}
    </>
  )

  let fabIn = false
  switch (variant) {
    case 'mobile': {
      fabIn =
        !smUp &&
        activeContent === ActiveContent.Canvas &&
        activeSlide === ActiveSlide.Content
      break
    }
    case 'canvas': {
      fabIn = smUp && activeContent === ActiveContent.Canvas
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
