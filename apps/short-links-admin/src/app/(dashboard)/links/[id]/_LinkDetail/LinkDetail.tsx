'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import PauseCircleOutlineRoundedIcon from '@mui/icons-material/PauseCircleOutlineRounded'
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded'
import PublishRoundedIcon from '@mui/icons-material/PublishRounded'
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useParams, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
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
import { useShortLinkAccess } from '../../../../../libs/useShortLinkAccess'
import { LinkForm, LinkFormValues, getVideoLabel } from '../../_LinkForm'

import { QrPanel } from './_QrPanel'

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
  const { enqueueSnackbar } = useSnackbar()
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

  if (loading) return <CircularProgress />
  if (error != null) return <Alert severity="error">{error.message}</Alert>

  const result = data?.shortLink
  if (result == null || result.__typename !== 'QueryShortLinkSuccess') {
    return (
      <Alert severity="error">
        {result != null && 'message' in result && result.message != null
          ? result.message
          : 'Link not found'}
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
      enqueueSnackbar(successMessage, { variant: 'success' })
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
        enqueueSnackbar(parseMutationError(outcome).message, {
          variant: 'error'
        })
        return
      }
      enqueueSnackbar('Republished to the edge', { variant: 'success' })
    } catch (caught) {
      enqueueSnackbar(
        caught instanceof Error ? caught.message : 'Republish failed',
        { variant: 'error' }
      )
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      const { data: deleted } = await remove({ variables: { id: link.id } })
      const outcome = deleted?.shortLinkDelete
      if (outcome != null && isMutationError(outcome)) {
        enqueueSnackbar(parseMutationError(outcome).message, {
          variant: 'error'
        })
        return
      }
      enqueueSnackbar('Link deleted', { variant: 'success' })
      router.push('/links')
    } catch (caught) {
      enqueueSnackbar(
        caught instanceof Error ? caught.message : 'Delete failed',
        { variant: 'error' }
      )
    } finally {
      setDeleteOpen(false)
    }
  }

  const busy = updating || publishing || deleting

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 1100 }}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
              <Typography component="h2" variant="h5" noWrap>
                {link.shortUrl}
              </Typography>
              <CopyButton value={link.shortUrl} label="Copy short URL" />
              <Tooltip title="Open short URL">
                <IconButton
                  size="small"
                  component="a"
                  href={link.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open short URL"
                >
                  <OpenInNewRoundedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <StatusChip status={link.status} />
              <HealthChip health={link.healthStatus} />
              {link.global && <Chip size="small" color="info" label="Global" />}
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {link.edgePublishedAt != null
                  ? `Published ${formatDateTime(link.edgePublishedAt)}`
                  : 'Not yet published to the edge'}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {link.status !== 'active' && (
              <Button
                size="small"
                startIcon={<PlayCircleOutlineRoundedIcon />}
                onClick={() => void handleStatus('active')}
                disabled={busy}
              >
                Activate
              </Button>
            )}
            {link.status === 'active' && (
              <Button
                size="small"
                startIcon={<PauseCircleOutlineRoundedIcon />}
                onClick={() => void handleStatus('paused')}
                disabled={busy}
              >
                Pause
              </Button>
            )}
            {link.status !== 'retired' && (
              <Button
                size="small"
                startIcon={<StopCircleOutlinedIcon />}
                onClick={() => void handleStatus('retired')}
                disabled={busy}
              >
                Retire
              </Button>
            )}
            {isAdmin && (
              <Button
                size="small"
                startIcon={<PublishRoundedIcon />}
                onClick={handlePublish}
                loading={publishing}
                disabled={busy}
              >
                Republish to edge
              </Button>
            )}
            {canDeleteLink(link.assetClass, isAdmin) && (
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={() => setDeleteOpen(true)}
                disabled={busy}
              >
                Delete
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

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
    </Stack>
  )
}
