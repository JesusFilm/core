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
import Box from '@mui/material/Box'
import { AccessDeniedListItem } from './AccessDeniedListItem'

interface AccessDeniedProps {
  handleClick?: () => void
  requestedAccess?: boolean
}

export function AccessDenied({
  handleClick,
  requestedAccess = false
}: AccessDeniedProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack alignItems="center" sx={{ width: '100%' }}>
        <Box sx={{ width: { xs: '296px', sm: '587px', md: '759px' } }}>
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
          <List
            disablePadding
            sx={{
              mt: 8,
              borderRadius: '6px',
              '& .MuiListItemText-root': {
                flex: '0 1 auto'
              }
            }}
          >
            <AccessDeniedListItem
              stepNumber={1}
              heading={t('Request Access')}
              description={t(
                'Send an access request to the creator of this journey'
              )}
              stepActive
              requestedAccess={requestedAccess}
              handleRequestAccess={handleClick}
            />
            <Divider
              sx={{
                height: '2px',
                bgcolor: requestedAccess ? 'divider' : 'primary.main'
              }}
            />
            <AccessDeniedListItem
              stepNumber={2}
              heading={t('Wait for Approval')}
              description={t('The owner needs to approve you as an editor')}
              stepActive={requestedAccess}
            />
            <Divider
              sx={{
                height: '2px',
                bgcolor: requestedAccess ? 'primary.main' : 'divider'
              }}
            />
            <AccessDeniedListItem
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
                startIcon={
                  <ContactSupportIcon sx={{ color: 'secondary.dark' }} />
                }
                size="small"
                variant="outlined"
              >
                {t('Get Help')}
              </Button>
            </NextLink>
          </Stack>
        </Box>
      </Stack>
    </>
  )
}
