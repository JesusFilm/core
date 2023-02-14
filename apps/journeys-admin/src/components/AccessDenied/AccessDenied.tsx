import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import Divider from '@mui/material/Divider'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'
import NextLink from 'next/link'
import Button from '@mui/material/Button'
import { AccessDeniedCard } from './AccessDeniedCard'

interface AccessDeniedProps {
  handleClick?: () => void
  requestAccess?: boolean
}

export function AccessDenied({
  handleClick,
  requestAccess = false
}: AccessDeniedProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack direction="row" alignItems="center">
        <Stack
          sx={{
            ml: 5,
            mr: 3,
            width: '40px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LockRoundedIcon sx={{ color: 'secondary.light' }} />
        </Stack>
        <Typography variant="h3" color="text.primary">
          {t(`You can't edit this journey`)}
        </Typography>
      </Stack>
      <List sx={{ mt: 8 }}>
        <AccessDeniedCard
          stepNumber={1}
          heading={t('Request Access')}
          description={t(
            'Send an access request to the creator of this journey'
          )}
          requestAccess={requestAccess}
          handleRequestAccess={handleClick}
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
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 7 }}>
        <NextLink href="/" passHref>
          <Button
            sx={{ color: 'primary.main' }}
            startIcon={<ChevronLeftRoundedIcon />}
            size="small"
          >
            {t('Back to my journeys')}
          </Button>
        </NextLink>
        <NextLink
          href="mailto:support@nextstep.is?subject=Need%20help%20with%20requesting%20editing%20access%20to%20the%20journey"
          passHref
        >
          <Button
            sx={{
              color: 'secondary.main',
              borderColor: 'secondary.main',
              '&:hover': {
                borderColor: 'secondary.main'
              }
            }}
            startIcon={<ContactSupportIcon sx={{ color: 'secondary.dark' }} />}
            size="small"
            variant="outlined"
          >
            {t('Get Help')}
          </Button>
        </NextLink>
      </Stack>
    </>
  )
}
