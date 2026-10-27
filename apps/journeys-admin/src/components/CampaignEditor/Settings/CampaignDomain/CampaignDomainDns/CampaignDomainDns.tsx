import { useMutation } from '@apollo/client/react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect } from 'react'

import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import {
  CheckCustomDomain,
  CheckCustomDomainVariables,
  CheckCustomDomain_customDomainCheck as CustomDomainCheck
} from '../../../../../../__generated__/CheckCustomDomain'
import { GetCampaign_campaign_customDomains as CampaignCustomDomain } from '../../../../../../__generated__/GetCampaign'
import { CHECK_CUSTOM_DOMAIN } from '../../../../Team/CustomDomainDialog/DNSConfigSection'

const VERCEL_APEX_IP = '76.76.21.21'
const VERCEL_CNAME = 'cname.vercel-dns.com'
const CHECK_INTERVAL_MS = 60 * 1000

type CampaignDomain = Pick<CampaignCustomDomain, 'id' | 'name' | 'apexName'>

export interface DnsRecord {
  type: string
  name: string
  value: string
}

/** A record's host as the registrar names it: `@` for the apex itself. */
function hostOf(domain: string, apexName: string): string {
  if (domain === apexName) return '@'
  return domain.replace(`.${apexName}`, '')
}

/**
 * The DNS records the campaign's domain needs, as the team dialog's
 * DNSConfigSection derives them: once Vercel has verified the domain, the
 * one routing record (A to Vercel's IP on an apex, else a CNAME); before
 * that, the verification records Vercel asks for.
 */
export function campaignDomainRecords(
  customDomain: CampaignDomain,
  check: CustomDomainCheck
): DnsRecord[] {
  if (!check.verified)
    return (check.verification ?? []).map((record) => ({
      type: record.type,
      name: hostOf(record.domain, customDomain.apexName),
      value: record.value
    }))
  const apex = customDomain.name === customDomain.apexName
  return [
    {
      type: apex ? 'A' : 'CNAME',
      name: hostOf(customDomain.name, customDomain.apexName),
      value: apex ? VERCEL_APEX_IP : VERCEL_CNAME
    }
  ]
}

interface CampaignDomainDnsProps {
  customDomain: CampaignDomain
}

/**
 * The Campaign Domain's DNS status and records for the narrow Settings
 * panel: the status line, then each record as a card with Type, Name and
 * Value stacked under their labels, the value copyable. Checked on mount and
 * every minute, as the team dialog does.
 */
export function CampaignDomainDns({
  customDomain
}: CampaignDomainDnsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [checkCustomDomain, { data }] = useMutation<
    CheckCustomDomain,
    CheckCustomDomainVariables
  >(CHECK_CUSTOM_DOMAIN)

  useEffect(() => {
    function check(): void {
      void checkCustomDomain({
        variables: { customDomainId: customDomain.id }
      }).catch(() => undefined)
    }
    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [checkCustomDomain, customDomain.id])

  async function handleCopy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value)
    enqueueSnackbar(t('Copied'), { variant: 'success', preventDuplicate: true })
  }

  const check = data?.customDomainCheck
  const status =
    check == null
      ? { label: t('Loading'), color: 'text.secondary' }
      : !check.verified
        ? { label: t('Pending Verfication'), color: 'warning.main' }
        : check.configured
          ? { label: t('Valid Configuration'), color: 'success.main' }
          : { label: t('Invalid Configuration'), color: 'error.main' }
  const records =
    check == null ? [] : campaignDomainRecords(customDomain, check)

  return (
    <Stack spacing={2} data-testid="CampaignDomainDns">
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
      >
        <Typography variant="subtitle2">{t('DNS Config')}</Typography>
        <Typography
          variant="body2"
          sx={{ color: status.color }}
          data-testid="CampaignDomainDnsStatus"
        >
          {status.label}
        </Typography>
      </Stack>
      {records.map((record, index) => (
        <Stack
          key={`${record.type}-${record.name}-${index}`}
          spacing={1.5}
          sx={{
            p: 3,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2
          }}
          data-testid="CampaignDomainDnsRecord"
        >
          <DnsRecordField label={t('Type')} value={record.type} />
          <DnsRecordField label={t('Name')} value={record.name} />
          <DnsRecordField
            label={t('Value')}
            value={record.value}
            action={
              <Tooltip title={t('Copy value')}>
                <IconButton
                  size="small"
                  aria-label={t('Copy value')}
                  onClick={() => {
                    void handleCopy(record.value)
                  }}
                >
                  <CopyLeftIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          />
        </Stack>
      ))}
      {check?.verificationResponse?.code === 'existing_project_domain' && (
        <Typography variant="body2" color="error">
          {t(
            'Domain {{ customDomainName }} was added to a different team. Please complete verification to add it to this team instead.',
            { customDomainName: customDomain.name }
          )}
        </Typography>
      )}
    </Stack>
  )
}

interface DnsRecordFieldProps {
  label: string
  value: string
  action?: ReactElement
}

function DnsRecordField({
  label,
  value,
  action
}: DnsRecordFieldProps): ReactElement {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            overflowWrap: 'anywhere',
            flexGrow: 1
          }}
        >
          {value}
        </Typography>
        {action}
      </Stack>
    </Box>
  )
}
