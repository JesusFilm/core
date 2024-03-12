import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import Check from '@core/shared/ui/icons/Check'
import CopyLeft from '@core/shared/ui/icons/CopyLeft'
import X3 from '@core/shared/ui/icons/X3'

interface DomainError {
  type: string | null
  domain: string | null
  value: string | null
}

interface DNSConfigSectionProps {
  verified: boolean
  name?: string
  apexName?: string
  domainError?: DomainError | null
}

export function DNSConfigSection({
  verified,
  name,
  apexName,
  domainError
}: DNSConfigSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  async function handleCopyClick(value): Promise<void> {
    await navigator.clipboard.writeText(value ?? '')
    enqueueSnackbar('Address copied', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Stack spacing={4}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="subtitle1">{t('DNS Config')}</Typography>
        <Chip
          icon={
            verified ? (
              <Check
                sx={{
                  borderRadius: 777,
                  backgroundColor: 'success.main',
                  '&.MuiSvgIcon-root': {
                    color: 'background.paper'
                  }
                }}
              />
            ) : (
              <X3
                sx={{
                  borderRadius: 777,
                  backgroundColor: 'error.main',
                  '&.MuiSvgIcon-root': {
                    color: 'background.paper'
                  }
                }}
              />
            )
          }
          label="Status"
        />
      </Stack>
      <Stack spacing={4}>
        {verified && (
          <Stack direction="row" sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid',
                borderColor: 'divider',
                color: 'secondary.light',
                borderRadius: '8px 0px 0px 8px',
                p: 4,
                width: '33%',
                wordBreak: 'break-all'
              }}
            >
              {apexName === name ? t('A') : t('CNAME')}
            </Box>
            <Box
              sx={{
                borderTop: '2px solid',
                borderBottom: '2px solid',
                borderColor: 'divider',
                color: 'secondary.light',
                p: 4,
                width: '33%',
                wordBreak: 'break-all'
              }}
            >
              <Typography>{apexName}</Typography>
            </Box>
            <Box
              sx={{
                border: '2px solid',
                borderRadius: '0px 8px 8px 0px',
                borderColor: 'divider',
                color: 'secondary.light',
                pl: 4,
                width: '33%',
                wordBreak: 'break-all'
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                height="100%"
                justifyContent="space-between"
              >
                {apexName === name
                  ? t('76.76.21.21')
                  : t('cname.vercel-dns.com')}

                <IconButton
                  onClick={async () => await handleCopyClick('76.76.21.21')}
                  aria-label="Copy"
                >
                  <CopyLeft />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        )}
        {!verified && domainError != null && (
          <Stack direction="row" sx={{ width: '100%' }}>
            <Box
              sx={{
                border: '2px solid',
                borderColor: 'divider',
                color: 'secondary.light',
                borderRadius: '8px 0px 0px 8px',
                p: 4,
                width: '33%',
                display: 'flex',
                alignItems: 'center',
                wordBreak: 'break-all'
              }}
            >
              {domainError.type}
            </Box>
            <Box
              sx={{
                borderTop: '2px solid',
                borderBottom: '2px solid',
                borderColor: 'divider',
                color: 'secondary.light',
                p: 4,
                width: '33%',
                wordBreak: 'break-all',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {domainError.domain?.replace('_vercel.', '')}
            </Box>
            <Box
              sx={{
                border: '2px solid',
                borderRadius: '0px 8px 8px 0px',
                borderColor: 'divider',
                color: 'secondary.light',
                pl: 4,
                width: '33%',
                wordBreak: 'break-all'
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                height="100%"
                justifyContent="space-between"
                sx={{ wordBreak: 'break-all' }}
              >
                {domainError.value}
                <IconButton
                  onClick={async () =>
                    await handleCopyClick(
                      domainError != null ? domainError.value : ''
                    )
                  }
                  aria-label="Copy"
                >
                  <CopyLeft />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
