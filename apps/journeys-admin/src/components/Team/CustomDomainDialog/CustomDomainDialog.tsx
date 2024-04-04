import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { Dialog } from '@core/shared/ui/Dialog/Dialog'

import { useCustomDomainsQuery } from '../../../libs/useCustomDomainsQuery'
import { useTeam } from '../TeamProvider'

import { DefaultJourneyForm } from './DefaultJourneyForm'
import { DNSConfigSection } from './DNSConfigSection'
import { DomainNameForm } from './DomainNameForm'

interface CustomDomainDialogProps {
  open?: boolean
  onClose?: () => void
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
      <Stack spacing={10}>
        <DomainNameForm customDomain={customDomain} loading={loading} />
        {customDomain != null && (
          <>
            <DefaultJourneyForm customDomain={customDomain} />
            <DNSConfigSection customDomain={customDomain} />
          </>
        )}
      </Stack>
    </Dialog>
  )
}
