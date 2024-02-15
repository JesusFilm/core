import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import BulbIcon from '@core/shared/ui/icons/Bulb'

import { MenuItem } from '../../../../MenuItem'

interface StrategyItemProps {
  variant: 'button' | 'list-item'
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
      component: ActiveContent.Action
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    closeMenu?.()
  }

  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<BulbIcon />}
          sx={{
            display: {
              xs: 'none',
              md: 'flex'
            }
          }}
          onClick={handleGoalsClick}
        >
          <Typography variant="subtitle2" sx={{ py: 1 }}>
            {t('StrategyItem')}
          </Typography>
        </Button>
      ) : (
        <MenuItem
          label="StrategyItem"
          icon={<BulbIcon />}
          onClick={handleGoalsClick}
        />
      )}
    </>
  )
}
