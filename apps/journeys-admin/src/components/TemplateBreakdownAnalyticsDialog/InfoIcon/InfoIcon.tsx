import { ReactElement } from 'react'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import { Item } from '../../Editor/Toolbar/Items/Item'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'

export function InfoIcon(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box sx={{ ml: 2 }}>
      <Item
        variant="icon-button"
        icon={<InformationCircleContainedIcon />}
        label={t('Only journeys with non-zero activity are shown')}
        ButtonProps={{
          sx: {
            cursor: 'default'
          }
        }}
      />
    </Box>
  )
}
