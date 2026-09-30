'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import {
  CircleStopIcon,
  ExternalLinkIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  Trash2Icon,
  UploadCloudIcon
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement, useState } from 'react'

import { ResultOf, graphql } from '@core/shared/gql'

import { ConfirmDialog } from '../../../../../components/ConfirmDialog'
import { CopyButton } from '../../../../../components/CopyButton'
import { DestinationHistoryTable } from '../../../../../components/DestinationHistoryTable'
import { StatsPanel } from '../../../../../components/StatsPanel'
import { HealthChip, StatusChip } from '../../../../../components/StatusChip'
import {
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  GET_SHORT_LINK_DOMAINS,
  SHORT_LINK_FIELDS,
  ShortLinkStatus,
  canDeleteLink,
  emptyToNull,
  formatDateTime,
  isMutationError,
  parseMutationError
} from '../../../../../libs/shortLink'
import { notify, notifyError } from '../../../../../libs/toast'
import { useShortLinkAccess } from '../../../../../libs/useShortLinkAccess'
import { LinkForm, LinkFormValues, getVideoLabel } from '../../_LinkForm'

import { QrPanel } from './_QrPanel'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export const GET_SHORT_LINK = graphql(
  `
    query GetShortLink($id: String!) {
      shortLink(id: $id) {
        __typename
        ... on QueryShortLinkSuccess {
          data {
            ...ShortLinkFields
            destinationHistory {
              id
              from
              to
              changedBy
              changedAt
              note
            }
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_FIELDS]
)

export const SHORT_LINK_UPDATE = graphql(
  `
    mutation ShortLinkUpdate($input: MutationShortLinkUpdateInput!) {
      shortLinkUpdate(input: $input) {
        __typename
        ... on MutationShortLinkUpdateSuccess {
          data {
            ...ShortLinkFields
            destinationHistory {
              id
              from
              to
              changedBy
              changedAt
              note
            }
          }
        }
        ... on ZodError {
          message
          fieldErrors {
            message
            path
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_FIELDS]
)

export const SHORT_LINK_DELETE = graphql(`
  mutation ShortLinkDelete($id: String!) {
    shortLinkDelete(id: $id) {
      __typename
      ... on MutationShortLinkDeleteSuccess {
        data {
          id
          deletedAt
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
`)

export const SHORT_LINK_PUBLISH = graphql(
  `
    mutation ShortLinkPublish($id: String!) {
      shortLinkPublish(id: $id) {
        __typename
        ... on MutationShortLinkPublishSuccess {
          data {
            ...ShortLinkFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_FIELDS]
)

type ShortLinkData = Extract<
  ResultOf<typeof GET_SHORT_LINK>['shortLink'],
  { __typename: 'QueryShortLinkSuccess' }
>['data']

export function toFormValues(link: ShortLinkData): LinkFormValues {
  return {
    hostname: link.domain.hostname,
    pathname: link.pathname,
    to: link.to,
    name: link.name ?? '',
    description: link.description ?? '',
    service: link.service,
    assetClass: link.assetClass,
    status: link.status,
    placement: link.placement ?? '',
    language: link.language ?? '',
    tags: [...link.tags],
    videoId: link.videoId ?? '',
    youtubeVideoId: link.youtubeVideoId ?? '',
    campaignIds: link.campaigns.map((campaign) => campaign.id),
    redirectStatus: link.redirectStatus ?? '',
    fallbackTo: link.fallbackTo ?? '',
    global: link.global,
    note: ''
  }
}

export function toUpdateInput(
  id: string,
  values: LinkFormValues,
  currentGlobal: boolean
) {
  return {
    id,
    to: values.to.trim(),
    name: emptyToNull(values.name),
    description: emptyToNull(values.description),
    assetClass: values.assetClass,
    status: values.status,
    redirectStatus: values.redirectStatus === '' ? null : values.redirectStatus,
    fallbackTo: emptyToNull(values.fallbackTo),
    placement: values.placement === '' ? null : values.placement,
    language: emptyToNull(values.language),
    tags: values.tags,
    videoId: emptyToNull(values.videoId),
    youtubeVideoId: emptyToNull(values.youtubeVideoId),
    campaignIds: values.campaignIds,
    // Toggling needs an admin; omit when unchanged so editors are not refused.
    ...(values.global !== currentGlobal ? { global: values.global } : {}),
    note: emptyToNull(values.note)
  }
}

export function LinkDetail(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAdmin } = useShortLinkAccess()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data, loading, error } = useQuery(GET_SHORT_LINK, {
    variables: { id }
  })
  const { data: domainData } = useQuery(GET_SHORT_LINK_DOMAINS)
  const { data: campaignData } = useQuery(GET_SHORT_LINK_CAMPAIGN_OPTIONS)
  const [update, { loading: updating }] = useMutation(SHORT_LINK_UPDATE)
  const [remove, { loading: deleting }] = useMutation(SHORT_LINK_DELETE)
  const [publish, { loading: publishing }] = useMutation(SHORT_LINK_PUBLISH)

  if (loading) return <Spinner aria-label="Loading link" />
  if (error != null)
    return (
      <Alert variant="error">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )

  const result = data?.shortLink
  if (result == null || result.__typename !== 'QueryShortLinkSuccess') {
    return (
      <Alert variant="error">
        <AlertDescription>
          {result != null && 'message' in result && result.message != null
            ? result.message
            : 'Link not found'}
        </AlertDescription>
      </Alert>
    )
  }

  const link = result.data
  const domains =
    domainData?.shortLinkDomains.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []
  const campaigns =
    campaignData?.shortLinkCampaigns.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []

  async function submitUpdate(
    values: LinkFormValues,
    successMessage: string
  ): Promise<boolean> {
    setErrorMessage(undefined)
    setFieldErrors(undefined)
    try {
      const { data: updated } = await update({
        variables: { input: toUpdateInput(link.id, values, link.global) }
      })
      const outcome = updated?.shortLinkUpdate
      if (outcome == null) {
        setErrorMessage('No response from the server')
        return false
      }
      if (isMutationError(outcome)) {
        const parsed = parseMutationError(outcome)
        setErrorMessage(parsed.message)
        setFieldErrors(parsed.fieldErrors)
        return false
      }
      notify(successMessage, 'success')
      return true
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : 'Could not save the link'
      )
      return false
    }
  }

  async function handleSubmit(values: LinkFormValues): Promise<void> {
    await submitUpdate(values, 'Link saved')
  }

  async function handleStatus(status: ShortLinkStatus): Promise<void> {
    await submitUpdate(
      { ...toFormValues(link), status },
      status === 'active'
        ? 'Link activated'
        : status === 'paused'
          ? 'Link paused'
          : 'Link retired'
    )
  }

  async function handlePublish(): Promise<void> {
    try {
      const { data: published } = await publish({
        variables: { id: link.id }
      })
      const outcome = published?.shortLinkPublish
      if (outcome != null && isMutationError(outcome)) {
        notify(parseMutationError(outcome).message, 'error')
        return
      }
      notify('Republished to the edge', 'success')
    } catch (caught) {
      notifyError(caught, 'Republish failed')
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      const { data: deleted } = await remove({ variables: { id: link.id } })
      const outcome = deleted?.shortLinkDelete
      if (outcome != null && isMutationError(outcome)) {
        notify(parseMutationError(outcome).message, 'error')
        return
      }
      notify('Link deleted', 'success')
      router.push('/links')
    } catch (caught) {
      notifyError(caught, 'Delete failed')
    } finally {
      setDeleteOpen(false)
    }
  }

  const busy = updating || publishing || deleting

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <Card>
        <CardPanel className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1">
              <h2 className="truncate text-xl font-semibold">
                {link.shortUrl}
              </h2>
              <CopyButton value={link.shortUrl} label="Copy short URL" />
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Open short URL"
                title="Open short URL"
                render={
                  <a href={link.shortUrl} target="_blank" rel="noreferrer" />
                }
              >
                <ExternalLinkIcon aria-hidden="true" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip status={link.status} />
              <HealthChip health={link.healthStatus} />
              {link.global && <Badge variant="info">Global</Badge>}
              <span className="text-muted-foreground text-xs">
                {link.edgePublishedAt != null
                  ? `Published ${formatDateTime(link.edgePublishedAt)}`
                  : 'Not yet published to the edge'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {link.status !== 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleStatus('active')}
                disabled={busy}
              >
                <PlayCircleIcon aria-hidden="true" />
                Activate
              </Button>
            )}
            {link.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleStatus('paused')}
                disabled={busy}
              >
                <PauseCircleIcon aria-hidden="true" />
                Pause
              </Button>
            )}
            {link.status !== 'retired' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleStatus('retired')}
                disabled={busy}
              >
                <CircleStopIcon aria-hidden="true" />
                Retire
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                loading={publishing}
                disabled={busy}
              >
                <UploadCloudIcon aria-hidden="true" />
                Republish to edge
              </Button>
            )}
            {canDeleteLink(link.assetClass, isAdmin) && (
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => setDeleteOpen(true)}
                disabled={busy}
              >
                <Trash2Icon aria-hidden="true" />
                Delete
              </Button>
            )}
          </div>
        </CardPanel>
      </Card>

      <LinkForm
        mode="edit"
        initialValues={toFormValues(link)}
        domains={domains}
        campaigns={campaigns}
        isAdmin={isAdmin}
        submitting={updating}
        errorMessage={errorMessage}
        fieldErrors={fieldErrors}
        videoLabel={getVideoLabel(link)}
        onSubmit={handleSubmit}
      />

      <QrPanel
        qrUrl={link.qrUrl}
        pathname={link.pathname}
        assetClass={link.assetClass}
      />

      <DestinationHistoryTable history={link.destinationHistory} />

      <StatsPanel linkId={link.id} csvFilename={`${link.pathname}-scans`} />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this link?"
        description={`${link.shortUrl} will stop resolving. The pathname stays reserved so it can never be reissued.`}
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  )
}
