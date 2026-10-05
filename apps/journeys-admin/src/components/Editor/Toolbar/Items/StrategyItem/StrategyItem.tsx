import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { ComponentProps, ReactElement } from 'react'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import BulbIcon from '@core/shared/ui/icons/Bulb'

import { useEditorLayout } from '../../../EditorLayoutContext'
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
  const { isLayered } = useEditorLayout()

  function handleGoalsClick(): void {
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Goals
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: isLayered ? ActiveSlide.Drawer : ActiveSlide.Content
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
