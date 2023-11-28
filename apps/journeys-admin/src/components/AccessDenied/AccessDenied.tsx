import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import HelpCircleContainedIcon from '@core/shared/ui/icons/HelpCircleContained'
import Lock1Icon from '@core/shared/ui/icons/Lock1'

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
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{ width: '100%', height: '100vh' }}
        data-testid="JourneysAdminAccessDenied"
      >
        <Box sx={{ width: { xs: '296px', sm: '587px', md: '759px' } }}>
          <Stack
            direction="row"
            alignItems="center"
            display={{ xs: 'none', sm: 'flex' }}
            sx={{ mb: 8 }}
          >
            <Lock1Icon
              sx={{ width: '40px', ml: 5, mr: 3, color: 'secondary.light' }}
            />
            <Typography variant="h3" color="text.primary">
              {t(`You can't edit this journey`)}
            </Typography>
          </Stack>
          <Stack
            alignItems="center"
            display={{ xs: 'flex', sm: 'none' }}
            sx={{ mb: 7 }}
          >
            <Lock1Icon
              sx={{
                width: '40px',
                ml: 5,
                mr: 3,
                color: '#AAACBB',
                mb: 4.5
              }}
            />
            <Typography variant="h4" color="text.primary" align="center">
              {t(`You can't edit this journey`)}
            </Typography>
          </Stack>
          <List
            disablePadding
            sx={{
              borderRadius: '6px',
              overflow: 'hidden'
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
                height: requestedAccess ? '1px' : '2px',
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
                height: requestedAccess ? '2px' : '1px',
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
            <Box display={{ xs: 'none', sm: 'flex' }}>
              <NextLink href="/" passHref legacyBehavior prefetch={false}>
                <Button
                  sx={{ color: 'primary.main' }}
                  startIcon={<ChevronLeftIcon />}
                  size="small"
                >
                  {t('Back to my journeys')}
                </Button>
              </NextLink>
            </Box>
            <Box display={{ xs: 'flex', sm: 'none' }}>
              <NextLink href="/" passHref legacyBehavior prefetch={false}>
                <Button
                  sx={{ color: 'primary.main' }}
                  startIcon={<ChevronLeftIcon />}
                  size="small"
                >
                  {t('All journeys')}
                </Button>
              </NextLink>
            </Box>
            <NextLink
              href="mailto:support@nextstep.is?subject=Need%20help%20with%20requesting%20editing%20access%20to%20the%20journey"
              passHref
              legacyBehavior
              prefetch={false}
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
                  <HelpCircleContainedIcon sx={{ color: 'secondary.dark' }} />
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
