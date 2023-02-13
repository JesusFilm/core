import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import Divider from '@mui/material/Divider'
import { AccessDeniedCard } from './AccessDeniedCard'

interface AccessDeniedProps {
  onClick?: () => void
  requestAccess?: boolean
}

export function AccessDenied({
  onClick,
  requestAccess = false
}: AccessDeniedProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack direction="row">
        <LockRoundedIcon />
        <Typography variant="h3">{t(`You can't edit this journey`)}</Typography>
      </Stack>
      <List>
        <AccessDeniedCard
          stepNumber={1}
          heading={t('Request Access')}
          description={t(
            'Send an access request to the creator of this journey'
          )}
        />
        <Divider />
        <AccessDeniedCard
          stepNumber={2}
          heading={t('Wait for Approval')}
          description={t('The owner needs to approve you as an editor')}
        />
        <Divider />
        <AccessDeniedCard
          stepNumber={3}
          heading={t('Edit this journey')}
          description={t(
            'Once approved you can open this journey in your admin'
          )}
        />
      </List>
    </>
  )
}
