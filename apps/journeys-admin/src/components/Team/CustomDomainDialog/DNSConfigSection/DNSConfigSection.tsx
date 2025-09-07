import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
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
import { ReactElement, useEffect } from 'react'

import AlertCircleIcon from '@core/shared/ui/icons/AlertCircle'
import CheckIcon from '@core/shared/ui/icons/Check'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'
import X3Icon from '@core/shared/ui/icons/X3'

import {
  CheckCustomDomain,
  CheckCustomDomainVariables
} from '../../../../../__generated__/CheckCustomDomain'
import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { CustomDomainDialogTitle } from '../CustomDomainDialogTitle'

interface DNSConfigSectionProps {
  customDomain: CustomDomain
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: '2px solid ',
  borderColor: theme.palette.divider,
  fontSize: '16px'
}))

export const CHECK_CUSTOM_DOMAIN = gql`
  mutation CheckCustomDomain($customDomainId: ID!) {
    customDomainCheck(id: $customDomainId) {
      configured
      verified
      verification {
        domain
        reason
        type
        value
      }
      verificationResponse {
        code
        message
      }
    }
  }
`

export function DNSConfigSection({
  customDomain
}: DNSConfigSectionProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [checkCustomDomain, { data }] = useMutation<
    CheckCustomDomain,
    CheckCustomDomainVariables
  >(CHECK_CUSTOM_DOMAIN)

  useEffect(() => {
    async function checkCustomDomainInUseEffect(): Promise<void> {
      if (customDomain != null) {
        await checkCustomDomain({
          variables: { customDomainId: customDomain?.id }
        })
      }
    }
    if (customDomain != null) {
      void checkCustomDomainInUseEffect()
      const interval = setInterval(
        checkCustomDomainInUseEffect,
        1000 * 60 // 60 seconds
      )
      return () => clearInterval(interval)
    }
    // only rerun useEffect when the id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkCustomDomain, customDomain?.id])

  async function handleCopyClick(value: string): Promise<void> {
    await navigator.clipboard.writeText(value)
    enqueueSnackbar(t('Copied'), {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return (
    <Box flexGrow={1}>
      <CustomDomainDialogTitle title={t('DNS Config')}>
        {data != null ? (
          <>
            {data.customDomainCheck.configured &&
              data.customDomainCheck.verified && (
                <>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    {t('Valid Configuration')}
                  </Typography>
                  <CheckIcon
                    sx={{
                      borderRadius: 777,
                      backgroundColor: 'success.main',
                      '&.MuiSvgIcon-root': {
                        color: 'background.paper'
                      }
                    }}
                  />
                </>
              )}
            {!data.customDomainCheck.configured &&
              data.customDomainCheck.verified && (
                <>
                  <Typography variant="body2" sx={{ color: 'error.main' }}>
                    {t('Invalid Configuration')}
                  </Typography>
                  <X3Icon
                    sx={{
                      borderRadius: 777,
                      backgroundColor: 'error.main',
                      '&.MuiSvgIcon-root': {
                        color: 'background.paper'
                      }
                    }}
                  />
                </>
              )}
            {!data.customDomainCheck.verified && (
              <>
                <Typography variant="body2" sx={{ color: 'warning.main' }}>
                  {t('Pending Verification')}
                </Typography>
                <AlertCircleIcon
                  sx={{
                    borderRadius: 777,
                    backgroundColor: 'warning.main',
                    '&.MuiSvgIcon-root': {
                      color: 'background.paper'
                    }
                  }}
                />
              </>
            )}
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('Loading')}
            </Typography>
            <AlertCircleIcon
              sx={{
                borderRadius: 777,
                backgroundColor: 'text.secondary',
                '&.MuiSvgIcon-root': {
                  color: 'background.paper'
                }
              }}
            />
          </>
        )}
      </CustomDomainDialogTitle>
      {data != null && (
        <>
          {data.customDomainCheck.verified && (
            <>
              {/* show in desktop */}
              <TableContainer sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Table component="table">
                  <TableRow>
                    <StyledTableCell align="left">
                      {customDomain.apexName === customDomain.name
                        ? 'A'
                        : 'CNAME'}
                    </StyledTableCell>
                    <StyledTableCell align="left" sx={{ maxWidth: 200 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {customDomain.apexName === customDomain.name
                            ? '@'
                            : customDomain.name.replace(
                                `.${customDomain.apexName}`,
                                ''
                              )}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        {customDomain.apexName === customDomain.name
                          ? '76.76.21.21'
                          : 'cname.vercel-dns.com'}
                        <IconButton
                          onClick={async () =>
                            await handleCopyClick(
                              customDomain.apexName === customDomain.name
                                ? '76.76.21.21'
                                : 'cname.vercel-dns.com'
                            )
                          }
                          aria-label="Copy"
                          sx={{ mr: -3 }}
                        >
                          <CopyLeftIcon />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                </Table>
              </TableContainer>
              {/* show in mobile */}
              <TableContainer sx={{ display: { xs: 'block', sm: 'none' } }}>
                <Table component="table">
                  <TableRow>
                    <StyledTableCell align="left">
                      {customDomain.apexName === customDomain.name
                        ? 'A'
                        : 'CNAME'}
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell align="left" sx={{ maxWidth: 200 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {customDomain.apexName === customDomain.name
                            ? '@'
                            : customDomain.name.replace(
                                `.${customDomain.apexName}`,
                                ''
                              )}
                        </Typography>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                  <TableRow>
                    <StyledTableCell align="left">
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        {customDomain.apexName === customDomain.name
                          ? '76.76.21.21'
                          : 'cname.vercel-dns.com'}
                        <IconButton
                          onClick={async () =>
                            await handleCopyClick(
                              customDomain.apexName === customDomain.name
                                ? '76.76.21.21'
                                : 'cname.vercel-dns.com'
                            )
                          }
                          aria-label="Copy"
                          sx={{ mr: -3 }}
                        >
                          <CopyLeftIcon />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </TableRow>
                </Table>
              </TableContainer>
            </>
          )}
          {!data.customDomainCheck.verified &&
            data.customDomainCheck.verification != null &&
            data.customDomainCheck.verification.map((domainError, idx) => (
              <div key={`${domainError.domain}-${idx}`}>
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
                        {domainError.domain.replace(
                          `.${customDomain.apexName}`,
                          ''
                        )}
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
                              await handleCopyClick(domainError.value)
                            }
                            aria-label="Copy"
                            sx={{ mr: -3 }}
                          >
                            <CopyLeftIcon />
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
                        {domainError.domain.replace(
                          `.${customDomain.apexName}`,
                          ''
                        )}
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
                              await handleCopyClick(domainError.value)
                            }
                            aria-label="Copy"
                            sx={{ mr: -3 }}
                          >
                            <CopyLeftIcon />
                          </IconButton>
                        </Stack>
                      </StyledTableCell>
                    </TableRow>
                  </Table>
                </TableContainer>
                {data.customDomainCheck.verificationResponse?.code ===
                  'existing_project_domain' && (
                  <Typography variant="body2" color="error">
                    {t(
                      'Domain {{ customDomainName }} was added to a different team. Please complete verification to add it to this team instead.',
                      { customDomainName: customDomain.name }
                    )}
                  </Typography>
                )}
              </div>
            ))}
        </>
      )}
    </Box>
  )
}
