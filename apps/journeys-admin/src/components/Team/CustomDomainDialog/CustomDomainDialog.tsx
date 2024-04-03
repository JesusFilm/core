import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Form } from 'formik'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'

import { useCustomDomainsQuery } from '../../../libs/useCustomDomainsQuery'
import { useTeam } from '../TeamProvider'

import { DefaultJourneyForm } from './DefaultJourneyForm'
import { DNSConfigSection } from './DNSConfigSection'
import { DomainNameUpdateForm } from './DomainNameUpdateForm'

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
  const { data: customDomainData, refetch: refetchCustomDomains } =
    useCustomDomainsQuery({
      variables: { teamId: activeTeam?.id as string },
      notifyOnNetworkStatusChange: true
    })

  useEffect(() => {
    void refetchCustomDomains()
  }, [activeTeam, refetchCustomDomains])

  const customDomain = customDomainData?.customDomains[0]

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
      <Form>
        <Stack spacing={10}>
          <DomainNameUpdateForm customDomain={customDomain} />
          <DefaultJourneyForm customDomain={customDomain} />
          <DNSConfigSection customDomain={customDomain} />
        </Stack>
      </Form>
    </Dialog>
  )
}
