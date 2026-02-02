import Fab from '@mui/material/Fab'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { usePage } from '../../../libs/PageWrapperProvider'
import {
  MOBILE_FAB_BOTTOM_OFFSET,
  MOBILE_FAB_RIGHT_OFFSET,
  MOBILE_HELPSCOUT_FAB_MARGIN_X,
  MOBILE_HELPSCOUT_FAB_WIDTH,
  MOBILE_HELPSCOUT_FAB_Z_INDEX
} from '../../HelpScoutBeacon/constants'

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
        bottom: MOBILE_FAB_BOTTOM_OFFSET,
        right:
          MOBILE_FAB_RIGHT_OFFSET +
          MOBILE_HELPSCOUT_FAB_WIDTH +
          MOBILE_HELPSCOUT_FAB_MARGIN_X,
        zIndex: MOBILE_HELPSCOUT_FAB_Z_INDEX,
        display: { xs: 'flex', md: 'none' }
      }}
      data-testid="AddJourneyFab"
    >
      <Plus2Icon sx={{ mr: 3 }} />
      {t('Add')}
    </Fab>
  )
}
