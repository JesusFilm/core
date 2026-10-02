'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { RefreshCwIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'

import { ResultOf, graphql } from '@core/shared/gql'

import { ConfirmDialog } from '../../../../../components/ConfirmDialog'
import { TextField } from '../../../../../components/form'
import {
  SHORT_LINK_DOMAIN_FIELDS,
  formatDomainLabel,
  isMutationError,
  parseMutationError
} from '../../../../../libs/shortLink'
import { notify, notifyError } from '../../../../../libs/toast'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

// Its own query, never part of ShortLinkDomainFields: every status costs
// several Cloudflare API calls, and the domain list loads 100 domains.
export const GET_SHORT_LINK_DOMAIN_INFRASTRUCTURE = graphql(`
  query GetShortLinkDomainInfrastructure($id: String!) {
    shortLinkDomain(id: $id) {
      __typename
      ... on QueryShortLinkDomainSuccess {
        data {
          id
          hostname
          pathPrefix
          infrastructure {
            configured
            workerName
            hostnameAllowed
            zone {
              state
              detail
            }
            kvNamespace {
              state
              detail
            }
            kvBinding {
              state
              detail
            }
            attachment {
              state
              detail
            }
          }
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
`)

export const SHORT_LINK_DOMAIN_KV_SETUP = graphql(
  `
    mutation ShortLinkDomainKvSetup($id: String!) {
      shortLinkDomainKvSetup(id: $id) {
        __typename
        ... on MutationShortLinkDomainKvSetupSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

export const SHORT_LINK_DOMAIN_KV_REMOVE = graphql(
  `
    mutation ShortLinkDomainKvRemove($id: String!) {
      shortLinkDomainKvRemove(id: $id) {
        __typename
        ... on MutationShortLinkDomainKvRemoveSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

export const SHORT_LINK_DOMAIN_WORKER_ATTACH = graphql(
  `
    mutation ShortLinkDomainWorkerAttach($id: String!) {
      shortLinkDomainWorkerAttach(id: $id) {
        __typename
        ... on MutationShortLinkDomainWorkerAttachSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

export const SHORT_LINK_DOMAIN_WORKER_DETACH = graphql(
  `
    mutation ShortLinkDomainWorkerDetach($id: String!) {
      shortLinkDomainWorkerDetach(id: $id) {
        __typename
        ... on MutationShortLinkDomainWorkerDetachSuccess {
          data {
            ...ShortLinkDomainFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_DOMAIN_FIELDS]
)

type DomainWithInfrastructure = Extract<
  ResultOf<typeof GET_SHORT_LINK_DOMAIN_INFRASTRUCTURE>['shortLinkDomain'],
  { __typename: 'QueryShortLinkDomainSuccess' }
>['data']
type Infrastructure = DomainWithInfrastructure['infrastructure']
type Check = Infrastructure['zone']
type Action = 'kvSetup' | 'kvRemove' | 'attach' | 'detach'

const STATE_BADGES: Record<
  Check['state'],
  { label: string; variant: 'success' | 'outline' | 'warning' | 'error' }
> = {
  ok: { label: 'OK', variant: 'success' },
  missing: { label: 'Missing', variant: 'outline' },
  mismatch: { label: 'Mismatch', variant: 'warning' },
  error: { label: 'Error', variant: 'error' },
  unknown: { label: 'Not checked', variant: 'outline' }
}

function CheckRow({
  label,
  check
}: {
  label: string
  check: Check
}): ReactElement {
  const badge = STATE_BADGES[check.state]
  return (
    <li className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-40 shrink-0 text-sm font-medium">{label}</span>
      <Badge variant={badge.variant} className="w-fit shrink-0">
        {badge.label}
      </Badge>
      <span className="text-muted-foreground text-sm break-all">
        {check.detail}
      </span>
    </li>
  )
}

interface DomainInfrastructureProps {
  domainId: string
}

/**
 * superAdmin only: the live state of a domain on Cloudflare and the buttons
 * that change it. Order of work is set up KV, then attach; and the reverse to
 * take a domain down.
 */
export function DomainInfrastructure({
  domainId
}: DomainInfrastructureProps): ReactElement {
  const [confirming, setConfirming] = useState<Action>()
  const [typedHostname, setTypedHostname] = useState('')
  const { data, loading, error, refetch } = useQuery(
    GET_SHORT_LINK_DOMAIN_INFRASTRUCTURE,
    {
      variables: { id: domainId },
      // always what Cloudflare says now, never a cached answer
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true
    }
  )
  const [kvSetup, { loading: settingUp }] = useMutation(
    SHORT_LINK_DOMAIN_KV_SETUP
  )
  const [kvRemove, { loading: removing }] = useMutation(
    SHORT_LINK_DOMAIN_KV_REMOVE
  )
  const [attach, { loading: attaching }] = useMutation(
    SHORT_LINK_DOMAIN_WORKER_ATTACH
  )
  const [detach, { loading: detaching }] = useMutation(
    SHORT_LINK_DOMAIN_WORKER_DETACH
  )
  const busy = settingUp || removing || attaching || detaching

  const result = data?.shortLinkDomain
  const domain =
    result?.__typename === 'QueryShortLinkDomainSuccess' ? result.data : null
  const infrastructure = domain?.infrastructure

  function closeConfirm(): void {
    setConfirming(undefined)
    setTypedHostname('')
  }

  async function run(action: Action): Promise<void> {
    const variables = { id: domainId }
    try {
      const outcome =
        action === 'kvSetup'
          ? (await kvSetup({ variables })).data?.shortLinkDomainKvSetup
          : action === 'kvRemove'
            ? (await kvRemove({ variables })).data?.shortLinkDomainKvRemove
            : action === 'attach'
              ? (await attach({ variables })).data?.shortLinkDomainWorkerAttach
              : (await detach({ variables })).data?.shortLinkDomainWorkerDetach
      if (outcome != null && isMutationError(outcome)) {
        notify(parseMutationError(outcome).message, 'error')
        return
      }
      notify(
        {
          kvSetup: 'KV set up and links published',
          kvRemove: 'KV setup removed',
          attach: 'Attached to the Worker',
          detach: 'Detached from the Worker'
        }[action],
        'success'
      )
    } catch (caught) {
      notifyError(caught, 'Cloudflare change failed')
    } finally {
      closeConfirm()
      await refetch()
    }
  }

  const address = domain != null ? formatDomainLabel(domain) : ''
  const workerName = infrastructure?.workerName ?? 'the Worker'
  const kvReady =
    infrastructure?.kvNamespace.state === 'ok' &&
    infrastructure.kvBinding.state === 'ok'
  const attachedHere =
    infrastructure?.attachment.state === 'ok' ||
    infrastructure?.attachment.state === 'mismatch'
  const hasKv =
    infrastructure != null &&
    (infrastructure.kvNamespace.state !== 'missing' ||
      infrastructure.kvBinding.state !== 'missing')
  const canChange =
    infrastructure?.configured === true && infrastructure.hostnameAllowed

  return (
    <Card data-testid="DomainInfrastructure">
      <CardPanel className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium">Cloudflare infrastructure</h3>
            <span className="text-muted-foreground text-xs">
              {infrastructure?.workerName != null
                ? `Worker ${infrastructure.workerName} · checked live`
                : 'Checked live against Cloudflare'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading || busy}
          >
            <RefreshCwIcon aria-hidden="true" />
            Check again
          </Button>
        </div>

        {error != null && (
          <Alert variant="error">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {loading && infrastructure == null && (
          <Spinner aria-label="Checking Cloudflare" />
        )}

        {infrastructure != null && !infrastructure.configured && (
          <Alert variant="info">
            <AlertDescription>
              Cloudflare infrastructure management is not configured in this
              environment. Locally, set the KV namespace id and Worker binding
              by hand under Edge publishing.
            </AlertDescription>
          </Alert>
        )}
        {infrastructure?.configured === true &&
          !infrastructure.hostnameAllowed && (
            <Alert variant="warning">
              <AlertDescription>
                This environment is not allowed to set {domain?.hostname} up on
                Cloudflare. It can still be detached or have its KV setup
                removed.
              </AlertDescription>
            </Alert>
          )}

        {infrastructure?.configured === true && (
          <>
            <ul className="divide-border divide-y">
              <CheckRow label="Zone" check={infrastructure.zone} />
              <CheckRow
                label="KV namespace"
                check={infrastructure.kvNamespace}
              />
              <CheckRow
                label="Worker binding"
                check={infrastructure.kvBinding}
              />
              <CheckRow
                label="Attached to Worker"
                check={infrastructure.attachment}
              />
            </ul>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void run('kvSetup')}
                loading={settingUp}
                disabled={busy || !canChange}
              >
                {kvReady ? 'Repair KV' : 'Set up KV'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming('attach')}
                disabled={
                  busy ||
                  !canChange ||
                  !kvReady ||
                  infrastructure.attachment.state === 'ok'
                }
              >
                Attach to Worker
              </Button>
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => setConfirming('detach')}
                disabled={busy || !attachedHere}
              >
                Detach from Worker
              </Button>
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => setConfirming('kvRemove')}
                disabled={busy || !hasKv || attachedHere}
              >
                Remove KV
              </Button>
            </div>
          </>
        )}
      </CardPanel>

      <ConfirmDialog
        open={confirming === 'attach'}
        title={`Attach ${address} to ${workerName}?`}
        description={`Live traffic for ${address} goes to ${workerName} as soon as Cloudflare applies it. A hostname already attached to another Worker is refused, not taken over.`}
        confirmLabel="Attach"
        loading={attaching}
        onConfirm={() => void run('attach')}
        onClose={closeConfirm}
      />
      <ConfirmDialog
        open={confirming === 'detach'}
        title={`Detach ${address} from ${workerName}?`}
        description={`Every short link on ${address} stops resolving until it is attached again.`}
        confirmLabel="Detach"
        confirmColor="error"
        loading={detaching}
        confirmDisabled={typedHostname.trim() !== domain?.hostname}
        onConfirm={() => void run('detach')}
        onClose={closeConfirm}
      >
        <div className="px-6 pb-2">
          <TextField
            id="confirm-detach-hostname"
            label={`Type ${domain?.hostname ?? 'the hostname'} to confirm`}
            value={typedHostname}
            onChange={(event) => setTypedHostname(event.target.value)}
            autoComplete="off"
          />
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirming === 'kvRemove'}
        title={`Remove the KV setup of ${domain?.hostname ?? 'this domain'}?`}
        description="The Worker binding is removed and the domain's links stop being published to the edge. The namespace is left in Cloudflare and is reused if KV is set up again."
        confirmLabel="Remove KV"
        confirmColor="error"
        loading={removing}
        onConfirm={() => void run('kvRemove')}
        onClose={closeConfirm}
      />
    </Card>
  )
}
