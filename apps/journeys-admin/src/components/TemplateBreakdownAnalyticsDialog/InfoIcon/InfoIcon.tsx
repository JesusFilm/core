import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { Item } from '../../Editor/Toolbar/Items/Item'

export function InfoIcon(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box sx={{ mx: 2, mr: 10 }}>
      <Item
        variant="icon-button"
        icon={<InformationCircleContainedIcon />}
        label={t('Rows and columns with zero activity are hidden')}
        ButtonProps={{
          sx: {
            cursor: 'default'
          }
        }}
      />
    </Box>
  )
}
