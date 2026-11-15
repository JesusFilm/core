import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { CampaignRole } from '../../utils/campaignRole'

interface ManagerRoleNoticeProps {
  role: CampaignRole
  /** Asks for `me` again. */
  onRetry?: () => void
}

/**
 * Beside manager-only controls that show disabled because the role could not
 * be read: "We couldn't check your role." with Retry. Nothing otherwise.
 */
export function ManagerRoleNotice({
  role,
  onRetry
}: ManagerRoleNoticeProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  if (role !== 'error') return <></>
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'center' }}
      data-testid="ManagerRoleNotice"
    >
      <Typography variant="body2" color="error">
        {t("We couldn't check your role.")}
      </Typography>
      <Button size="small" onClick={onRetry}>
        {t('Retry')}
      </Button>
    </Stack>
  )
}

/** A manager-only button's icon: a spinner while the role is pending. */
export function managerControlIcon(
  role: CampaignRole,
  icon?: ReactElement
): ReactElement | undefined {
  if (role === 'pending') return <CircularProgress size={16} color="inherit" />
  return icon
}
