import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

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
    <Box data-testid="StrategyItem">
      <Item
        variant={variant}
        label={t('Strategy')}
        icon={<BulbIcon />}
        onClick={handleGoalsClick}
        ButtonProps={{
          sx: {
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px'
            }
          }
        }}
      />
    </Box>
  )
}
