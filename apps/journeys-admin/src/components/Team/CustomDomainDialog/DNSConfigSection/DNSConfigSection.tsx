import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import Check from '@core/shared/ui/icons/Check'
import CopyLeft from '@core/shared/ui/icons/CopyLeft'
import Lightning2 from '@core/shared/ui/icons/Lightning2'
import X3 from '@core/shared/ui/icons/X3'

interface DomainError {
  type: string | null
  domain: string | null
  value: string | null
}

interface DNSConfigSectionProps {
  verified: boolean
  misconfigured: boolean
  name?: string
  apexName?: string
  domainError?: DomainError | null
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: '2px solid ',
  borderColor: theme.palette.divider,
  fontSize: '16px'
}))

export function DNSConfigSection({
  verified,
  misconfigured,
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
    <Stack spacing={4} direction="row">
      <Lightning2 sx={{ color: 'secondary.light' }} />
      <Stack spacing={4} width="100%">
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1">{t('DNS Config')}</Typography>
          <Stack direction="row" spacing={2} sx={{ mr: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: verified || misconfigured ? 'success.main' : 'error.main'
              }}
            >
              {t('Status')}
            </Typography>
            {verified || misconfigured ? (
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
            )}
          </Stack>
        </Stack>
        <Stack spacing={4}>
          {domainError == null && (
            <>
              <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Table>
                  <TableRow>
                    <StyledTableCell align="left">
                      {apexName === name ? t('A') : t('CNAME')}
                    </StyledTableCell>
                    <StyledTableCell align="left">{apexName}</StyledTableCell>
                    <StyledTableCell align="left">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        {apexName === name
                          ? '76.76.21.21'
                          : 'cname.vercel-dns.com'}
                        <IconButton
                          onClick={async () =>
                            await handleCopyClick(
                              apexName === name
                                ? '76.76.21.21'
                                : 'cname.vercel-dns.com'
                            )
                          }
                          aria-label="Copy"
                          sx={{ mr: -3 }}
                        >
                          <CopyLeft />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                </Table>
              </TableContainer>
              <TableContainer sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Table>
                  <TableRow>
                    <StyledTableCell align="left">
                      {apexName === name ? t('A') : t('CNAME')}
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell align="left">{apexName}</StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell align="left">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        {apexName === name
                          ? t('76.76.21.21')
                          : t('cname.vercel-dns.com')}
                        <IconButton
                          onClick={async () =>
                            await handleCopyClick(
                              apexName === name
                                ? '76.76.21.21'
                                : 'cname.vercel-dns.com'
                            )
                          }
                          aria-label="Copy"
                          sx={{ mr: -3 }}
                        >
                          <CopyLeft />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                </Table>
              </TableContainer>
            </>
          )}

          {!verified && domainError != null && (
            <>
              <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Table
                  sx={{
                    tableLayout: 'fixed',
                    width: '100%',
                    overflowWrap: 'anywhere'
                  }}
                >
                  <TableRow>
                    <StyledTableCell align="left">
                      {domainError.type}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {domainError.domain?.replace('_vercel.', '')}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        {domainError.value}
                        <IconButton
                          onClick={async () =>
                            await handleCopyClick(
                              domainError != null ? domainError.value : ''
                            )
                          }
                          aria-label="Copy"
                          sx={{ mr: -3 }}
                        >
                          <CopyLeft />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                </Table>
              </TableContainer>
              <TableContainer sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Table
                  sx={{
                    tableLayout: 'fixed',
                    width: '100%',
                    overflowWrap: 'anywhere'
                  }}
                >
                  <TableRow>
                    <StyledTableCell align="left">
                      {domainError.type}
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell align="left">
                      {domainError.domain?.replace('_vercel.', '')}
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell align="left">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        {domainError.value}
                        <IconButton
                          onClick={async () =>
                            await handleCopyClick(
                              domainError != null ? domainError.value : ''
                            )
                          }
                          aria-label="Copy"
                          sx={{ mr: -3 }}
                        >
                          <CopyLeft />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                </Table>
              </TableContainer>
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
