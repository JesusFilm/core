import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import EmailIcon from '@core/shared/ui/icons/Email'
import ShieldCheck from '@core/shared/ui/icons/ShieldCheck'
import UsersProfiles2 from '@core/shared/ui/icons/UsersProfiles2'

export interface JourneyUsersHeadingProps {
  usersText: string
  emailNotificationsText: string
  userRoleText: string
}

export function JourneyUsersHeading({
  usersText,
  emailNotificationsText,
  userRoleText
}: JourneyUsersHeadingProps): ReactElement {
  return (
    <>
      <Grid container spacing={1} alignItems="center" sx={{ pb: 4 }}>
        <Grid size={{ xs: 2, sm: 1 }}>
          <Stack sx={{ ml: 2 }}>
            <UsersProfiles2 sx={{ color: 'secondary.light' }} />
          </Stack>
        </Grid>
        <Grid size={{ xs: 5, sm: 7 }}>
          <Typography
            variant="subtitle3"
            color="secondary.light"
            sx={{ opacity: 0.8, ml: 1 }}
          >
            {usersText}
          </Typography>
        </Grid>
        <Grid size={{ xs: 2, sm: 2 }}>
          <Stack sx={{ ml: 4 }}>
            <Tooltip title={emailNotificationsText}>
              <EmailIcon sx={{ color: 'secondary.light' }} />
            </Tooltip>
          </Stack>
        </Grid>
        <Grid size={{ xs: 3, sm: 2 }}>
          <Stack sx={{ ml: 7 }}>
            <Tooltip title={userRoleText}>
              <ShieldCheck sx={{ color: 'secondary.light' }} />
            </Tooltip>
          </Stack>
        </Grid>
      </Grid>
    </>
  )
}
