import { ComponentProps, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
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
  const { dispatch } = useEditor()

  function handleGoalsClick(): void {
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Goals
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    closeMenu?.()
  }

  return (
    <Item
      variant={variant}
      label={t('Strategy')}
      icon={<BulbIcon />}
      onClick={handleGoalsClick}
    />
  )
}
