import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'
import ComputerIcon from '@core/shared/ui/icons/Computer'
import Globe2Icon from '@core/shared/ui/icons/Globe2'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'
import Lightning2Icon from '@core/shared/ui/icons/Lightning2'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'

import { useCustomDomainsQuery } from '../../../libs/useCustomDomainsQuery'
import { useTeam } from '../TeamProvider'

import { CustomDomainDialogTitle } from './CustomDomainDialogTitle'
import { DefaultJourneyForm } from './DefaultJourneyForm'
import { DNSConfigSection } from './DNSConfigSection'
import { DomainNameForm } from './DomainNameForm'

interface CustomDomainDialogProps {
  open: boolean
  onClose: () => void
}

export function CustomDomainDialog({
  open,
  onClose
}: CustomDomainDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { data, refetch, loading } = useCustomDomainsQuery({
    variables: { teamId: activeTeam?.id as string },
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    // rerun query if user changes active team
    void refetch()
  }, [activeTeam, refetch])

  const customDomain = data?.customDomains[0]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      divider
      dialogTitle={{
        title: t('Domain Settings'),
        closeButton: true
      }}
      fullscreen={!smUp}
      sx={{ '& .MuiDialogContent-dividers': { px: 6, py: 9 } }}
    >
      <Stack spacing={6}>
        <Stack spacing={4} direction="row">
          <InformationCircleContainedIcon sx={{ color: 'secondary.light' }} />
          <Box flexGrow={1}>
            <CustomDomainDialogTitle title={t('Custom Domain Setup')}>
              <Box>
                <Button
                  endIcon={<LinkExternalIcon />}
                  href="https://support.nextstep.is/article/1365-custom-domains"
                  target="_blank"
                  size="small"
                  sx={{ mt: -2 }}
                >
                  {t('Instructions')}
                </Button>
              </Box>
            </CustomDomainDialogTitle>
            <Typography>
              {t(
                'NextSteps provides all journeys with a your.nextstep.is URL. However, to provide greater personalization and flexibility to your team, you can instead add a custom domain. To get started you’ll need to purchase a domain, complete the form below, and point it to NextSteps servers.'
              )}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={4} direction="row">
          <Globe2Icon sx={{ color: 'secondary.light' }} />
          <DomainNameForm customDomain={customDomain} loading={loading} />
        </Stack>
        {customDomain != null && (
          <>
            <Stack spacing={4} direction="row">
              <ComputerIcon sx={{ color: 'secondary.light' }} />
              <DefaultJourneyForm customDomain={customDomain} />
            </Stack>
            <Divider />
            <Stack spacing={4} direction="row">
              <Lightning2Icon sx={{ color: 'secondary.light' }} />
              <DNSConfigSection customDomain={customDomain} />
            </Stack>
          </>
        )}
      </Stack>
    </Dialog>
  )
}
