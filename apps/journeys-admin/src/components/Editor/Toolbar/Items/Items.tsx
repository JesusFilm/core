import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useQuery } from '@apollo/client'
import { GetMe } from '../../../../../__generated__/GetMe'
import { HelpScoutBeacon } from '../../../HelpScoutBeacon'
import { GET_ME } from '../../../PageWrapper/NavigationDrawer/UserNavigation'
import { AnalyticsItem } from './AnalyticsItem'
import { PreviewItem } from './PreviewItem'
import { ShareItem } from './ShareItem'
import { StrategyItem } from './StrategyItem'

export function Items(): ReactElement {
  const { data } = useQuery<GetMe>(GET_ME)

  console.log(data)
  return (
    <Stack
      sx={{ display: { xs: 'none', sm: 'flex' } }}
      flexDirection="row"
      alignItems="center"
      gap={5}
      data-testid="ItemsStack"
    >
      <AnalyticsItem variant="icon-button" />
      <StrategyItem variant="button" />
      <ShareItem variant="button" />
      <PreviewItem variant="icon-button" />
      <HelpScoutBeacon
        userInfo={{
          name: `${data?.me?.firstName} ${data?.me?.lastName}`,
          email: data?.me?.email
        }}
      />
    </Stack>
  )
}
