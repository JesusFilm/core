import { CombinedGraphQLErrors, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { KeyboardEvent, ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  CampaignDomainCreate,
  CampaignDomainCreateVariables
} from '../../../../../__generated__/CampaignDomainCreate'
import {
  DeleteCustomDomain,
  DeleteCustomDomainVariables
} from '../../../../../__generated__/DeleteCustomDomain'
import { GetCampaign_campaign as Campaign } from '../../../../../__generated__/GetCampaign'
import { CampaignStatus } from '../../../../../__generated__/globalTypes'
import { DELETE_CUSTOM_DOMAIN } from '../../../Team/CustomDomainDialog/DomainNameForm/DomainNameForm'

import { CampaignDomainDns } from './CampaignDomainDns'

export const CAMPAIGN_DOMAIN_CREATE = gql`
  mutation CampaignDomainCreate($input: CustomDomainCreateInput!) {
    customDomainCreate(input: $input) {
      id
      name
      apexName
    }
  }
`

// The API's isDomainValid, as the team dialog's DomainNameForm checks it.
const DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z]$/

type PendingChange = 'connect' | 'disconnect'

interface CampaignDomainProps {
  campaign: Pick<Campaign, 'id' | 'teamId' | 'status' | 'customDomains'>
  /** Adding, checking and removing the domain registers it with Vercel: managers only. */
  isManager: boolean
}

/**
 * The Campaign Domain section of campaign Settings, mirroring the team Custom
 * Domain dialog: the domain field with Connect / Disconnect, then its DNS
 * status and records (`CampaignDomainDns`). Members see the name read-only. On a published
 * campaign both changes are confirmed first, since the public address moves.
 */
export function CampaignDomain({
  campaign,
  isManager
}: CampaignDomainProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState<PendingChange>()
  const [createDomain, { loading: creating }] = useMutation<
    CampaignDomainCreate,
    CampaignDomainCreateVariables
  >(CAMPAIGN_DOMAIN_CREATE)
  const [deleteDomain, { loading: deleting }] = useMutation<
    DeleteCustomDomain,
    DeleteCustomDomainVariables
  >(DELETE_CUSTOM_DOMAIN)

  const domain = campaign.customDomains[0]
  const published = campaign.status === CampaignStatus.published
  const trimmedName = name.trim().toLowerCase()

  function errorMessage(caught: unknown): string {
    const message = caught instanceof Error ? caught.message : ''
    if (
      message.includes('custom domain already exists') ||
      message.includes("it's already in use by your account.")
    )
      return t(
        "This domain is already in use. Remove it where it's connected, then add it here."
      )
    if (
      CombinedGraphQLErrors.is(caught) &&
      caught.errors[0]?.extensions?.code === 'BAD_USER_INPUT' &&
      caught.errors[0]?.extensions?.field != null
    )
      return caught.errors[0].message
    return t('Something went wrong, please reload the page and try again')
  }

  async function connect(): Promise<void> {
    setPending(undefined)
    try {
      await createDomain({
        variables: {
          input: {
            teamId: campaign.teamId,
            name: trimmedName,
            campaignId: campaign.id
          }
        },
        update: (cache, { data }) => {
          if (data?.customDomainCreate == null) return
          const ref = cache.writeFragment({
            data: data.customDomainCreate,
            fragment: gql`
              fragment NewCampaignDomain on CustomDomain {
                id
                name
                apexName
              }
            `
          })
          cache.modify({
            id: cache.identify({ __typename: 'Campaign', id: campaign.id }),
            fields: { customDomains: () => [ref] }
          })
        }
      })
      setName('')
      enqueueSnackbar(t('Domain connected'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (caught) {
      enqueueSnackbar(errorMessage(caught), {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  async function disconnect(): Promise<void> {
    setPending(undefined)
    if (domain == null) return
    try {
      await deleteDomain({
        variables: { customDomainId: domain.id },
        update: (cache) => {
          cache.modify({
            id: cache.identify({ __typename: 'Campaign', id: campaign.id }),
            fields: { customDomains: () => [] }
          })
          cache.evict({
            id: cache.identify({ __typename: 'CustomDomain', id: domain.id })
          })
          cache.gc()
        }
      })
      enqueueSnackbar(t('Domain disconnected'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (caught) {
      enqueueSnackbar(errorMessage(caught), {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  function handleConnect(): void {
    if (!DOMAIN_PATTERN.test(trimmedName)) {
      setError(t('Must be a valid URL'))
      return
    }
    setError(undefined)
    if (published) {
      setPending('connect')
      return
    }
    void connect()
  }

  function handleDisconnect(): void {
    if (published) {
      setPending('disconnect')
      return
    }
    void disconnect()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') handleConnect()
  }

  function handleConfirm(): void {
    if (pending === 'connect') void connect()
    if (pending === 'disconnect') void disconnect()
  }

  return (
    <Stack spacing={3} data-testid="CampaignDomain">
      <Box>
        <Typography variant="subtitle2">{t('Domain')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t(
            'Serve this campaign on its own domain. Once connected, the domain is its only address.'
          )}
        </Typography>
      </Box>
      {domain != null ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <TextField
            value={domain.name}
            fullWidth
            hiddenLabel
            variant="filled"
            helperText={
              isManager
                ? undefined
                : t('Only team managers can change the domain')
            }
            slotProps={{
              input: { readOnly: true },
              htmlInput: { 'aria-label': t('Domain Name') }
            }}
          />
          {isManager && (
            <Button
              onClick={handleDisconnect}
              disabled={deleting}
              sx={{ height: 55, flexShrink: 0 }}
            >
              {t('Disconnect')}
            </Button>
          )}
        </Stack>
      ) : isManager ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
          <TextField
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError(undefined)
            }}
            onKeyDown={handleKeyDown}
            fullWidth
            autoComplete="off"
            variant="filled"
            label={t('Domain Name')}
            placeholder="campaign.example.org"
            error={error != null}
            helperText={error ?? ' '}
            disabled={creating}
            slotProps={{ htmlInput: { 'aria-label': t('Domain Name') } }}
          />
          <Button
            onClick={handleConnect}
            disabled={creating || trimmedName === ''}
            sx={{ height: 55, flexShrink: 0 }}
          >
            {t('Connect')}
          </Button>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('No domain. Only team managers can add one.')}
        </Typography>
      )}
      {domain != null && isManager && (
        <CampaignDomainDns customDomain={domain} />
      )}
      <Dialog
        open={pending != null}
        onClose={() => setPending(undefined)}
        dialogTitle={{
          title:
            pending === 'disconnect'
              ? t('Disconnect domain?')
              : t('Connect domain?'),
          closeButton: true
        }}
        dialogAction={{
          onSubmit: handleConfirm,
          submitLabel:
            pending === 'disconnect' ? t('Disconnect') : t('Connect'),
          closeLabel: t('Cancel')
        }}
        testId="CampaignDomainConfirmDialog"
      >
        <Typography>
          {pending === 'disconnect'
            ? t('The campaign moves back to its your.nextstep.is address.')
            : t(
                'Your your.nextstep.is address stops working now. The campaign shows on {{domain}} once its DNS is set up.',
                { domain: trimmedName }
              )}
        </Typography>
      </Dialog>
    </Stack>
  )
}
