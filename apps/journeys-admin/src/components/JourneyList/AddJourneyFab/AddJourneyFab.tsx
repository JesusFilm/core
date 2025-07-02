import Fab from '@mui/material/Fab'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { usePage } from '../../../libs/PageWrapperProvider'

export function AddJourneyFab(): ReactElement {
  const {
    state: { mobileDrawerOpen },
    dispatch
  } = usePage()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Fab
      variant="extended"
      size="large"
      color="primary"
      onClick={() => {
        dispatch({
          type: 'SetMobileDrawerOpenAction',
          mobileDrawerOpen: !mobileDrawerOpen
        })
      }}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 3,
        display: { xs: 'flex', md: 'none' }
      }}
      data-testid="AddJourneyFab"
    >
      <Plus2Icon sx={{ mr: 3 }} />
      {t('Add')}
    </Fab>
  )
}
