import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import BulbIcon from '@core/shared/ui/icons/Bulb'

import { Item } from '../Item/Item'

interface StrategyItemProps {
  variant: ComponentProps<typeof Item>['variant']
  closeMenu?: () => void
}

export function StrategyItem({
  variant,
  closeMenu
}: StrategyItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    dispatch,
    state: { showAnalytics }
  } = useEditor()

  function handleGoalsClick(): void {
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Goals
    })
    dispatch({
      type: 'SetActiveCanvasDetailsDrawerAction',
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Drawer
    })
    closeMenu?.()
  }

  return (
    <Box data-testid="StrategyItem">
      <Item
        variant={variant}
        label={t('Strategy')}
        icon={<BulbIcon />}
        onClick={handleGoalsClick}
        ButtonProps={{ disabled: showAnalytics }}
        MenuItemProps={{ disabled: showAnalytics }}
      />
    </Box>
  )
}
