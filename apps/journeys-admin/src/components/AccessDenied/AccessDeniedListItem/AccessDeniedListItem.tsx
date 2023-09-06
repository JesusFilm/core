import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import CheckContained from '@core/shared/ui/icons/CheckContained'
import UsersProfiles2 from '@core/shared/ui/icons/UsersProfiles2'

interface AccessDeniedListItemProps {
  stepNumber: number
  heading: string
  description: string
  stepActive?: boolean
  requestedAccess?: boolean
  handleRequestAccess?: () => void
}

export function AccessDeniedListItem({
  stepNumber,
  heading,
  description,
  stepActive = false,
  requestedAccess = false,
  handleRequestAccess
}: AccessDeniedListItemProps): ReactElement {
  return (
    <ListItem
      sx={{
        bgcolor: stepActive ? 'background.paper' : '#F5F5F5',
        padding: 5
      }}
    >
      <Typography
        sx={{
          fontFamily: 'Montserrat',
          fontWeight: 400,
          fontSize: '36px',
          lineHeight: '40px',
          textAlign: 'center',
          color: 'secondary.light',
          fontStyle: 'normal',
          width: '40px'
        }}
      >
        {stepNumber}
      </Typography>
      <Stack sx={{ ml: 3 }}>
        <Typography variant="h6">{heading}</Typography>
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {description}
        </Typography>
        <Box display={{ xs: 'flex', sm: 'none' }} sx={{ mt: 1.5 }}>
          <RequestAccess
            handleRequestAccess={handleRequestAccess}
            requestedAccess={requestedAccess}
          />
        </Box>
      </Stack>
      <Box display={{ xs: 'none', sm: 'flex' }} sx={{ ml: 'auto' }}>
        <RequestAccess
          handleRequestAccess={handleRequestAccess}
          requestedAccess={requestedAccess}
        />
      </Box>
    </ListItem>
  )
}

export interface RequestAccessProps {
  handleRequestAccess?: () => void
  requestedAccess: boolean
}

export function RequestAccess({
  handleRequestAccess,
  requestedAccess
}: RequestAccessProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      {handleRequestAccess != null &&
        (requestedAccess ? (
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              color: 'success.main',
              mr: 3,
              px: { xs: 0, sm: '12px' },
              py: '6px'
            }}
            flexShrink={0}
          >
            <CheckContained fontSize="small" sx={{ mr: 2 }} />
            <Typography variant="subtitle2">{t('Request Sent')}</Typography>
          </Stack>
        ) : (
          <Button
            variant="contained"
            onClick={handleRequestAccess}
            startIcon={<UsersProfiles2 />}
            sx={{ flexShrink: 0, borderRadius: '12px' }}
          >
            {t('Request Now')}
          </Button>
        ))}
    </>
  )
}
