'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { ConfirmDialog } from '../../../../../components/ConfirmDialog'
import { StatsPanel } from '../../../../../components/StatsPanel'
import { StatusChip } from '../../../../../components/StatusChip'
import {
  SHORT_LINK_CAMPAIGN_FIELDS,
  SHORT_LINK_FIELDS,
  formatDate,
  isMutationError,
  parseMutationError,
  toDateInputValue,
  toIsoString
} from '../../../../../libs/shortLink'
import { CampaignForm, CampaignFormValues } from '../../_CampaignForm'
import { toCampaignInput } from '../../new/_NewCampaign'

export const GET_SHORT_LINK_CAMPAIGN = graphql(
  `
    query GetShortLinkCampaign($id: String!) {
      shortLinkCampaign(id: $id) {
        __typename
        ... on QueryShortLinkCampaignSuccess {
          data {
            ...ShortLinkCampaignFields
            shortLinks {
              ...ShortLinkFields
            }
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_CAMPAIGN_FIELDS, SHORT_LINK_FIELDS]
)

export const SHORT_LINK_CAMPAIGN_UPDATE = graphql(
  `
    mutation ShortLinkCampaignUpdate(
      $input: MutationShortLinkCampaignUpdateInput!
    ) {
      shortLinkCampaignUpdate(input: $input) {
        __typename
        ... on MutationShortLinkCampaignUpdateSuccess {
          data {
            ...ShortLinkCampaignFields
          }
        }
        ... on NotFoundError {
          message
        }
      }
    }
  `,
  [SHORT_LINK_CAMPAIGN_FIELDS]
)

export const SHORT_LINK_CAMPAIGN_DELETE = graphql(`
  mutation ShortLinkCampaignDelete($id: String!) {
    shortLinkCampaignDelete(id: $id) {
      __typename
      ... on MutationShortLinkCampaignDeleteSuccess {
        data {
          id
        }
      }
      ... on NotFoundError {
        message
      }
    }
  }
`)

export function CampaignDetail(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data, loading, error } = useQuery(GET_SHORT_LINK_CAMPAIGN, {
    variables: { id }
  })
  const [update, { loading: updating }] = useMutation(
    SHORT_LINK_CAMPAIGN_UPDATE
  )
  const [remove, { loading: deleting }] = useMutation(
    SHORT_LINK_CAMPAIGN_DELETE
  )

  if (loading) return <CircularProgress />
  if (error != null) return <Alert severity="error">{error.message}</Alert>
  const result = data?.shortLinkCampaign
  if (result == null || result.__typename !== 'QueryShortLinkCampaignSuccess') {
    return (
      <Alert severity="error">
        {result != null && 'message' in result && result.message != null
          ? result.message
          : 'Campaign not found'}
      </Alert>
    )
  }
  const campaign = result.data

  const initialValues: CampaignFormValues = {
    name: campaign.name,
    description: campaign.description ?? '',
    startsAt: toDateInputValue(campaign.startsAt),
    endsAt: toDateInputValue(campaign.endsAt),
    tags: [...campaign.tags]
  }
  const hasRange = campaign.startsAt != null && campaign.endsAt != null
  const statsFrom = hasRange ? toIsoString(campaign.startsAt) : undefined
  const statsTo = hasRange ? toIsoString(campaign.endsAt) : undefined

  async function handleSubmit(values: CampaignFormValues): Promise<void> {
    setErrorMessage(undefined)
    try {
      const { data: updated } = await update({
        variables: { input: { id: campaign.id, ...toCampaignInput(values) } }
      })
      const outcome = updated?.shortLinkCampaignUpdate
      if (outcome != null && isMutationError(outcome)) {
        setErrorMessage(parseMutationError(outcome).message)
        return
      }
      enqueueSnackbar('Campaign saved', { variant: 'success' })
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : 'Could not save the campaign'
      )
    }
  }

  async function handleDelete(): Promise<void> {
    try {
      const { data: deleted } = await remove({ variables: { id: campaign.id } })
      const outcome = deleted?.shortLinkCampaignDelete
      if (outcome != null && isMutationError(outcome)) {
        enqueueSnackbar(parseMutationError(outcome).message, {
          variant: 'error'
        })
        return
      }
      enqueueSnackbar('Campaign deleted', { variant: 'success' })
      router.push('/campaigns')
    } catch (caught) {
      enqueueSnackbar(
        caught instanceof Error ? caught.message : 'Delete failed',
        { variant: 'error' }
      )
    } finally {
      setDeleteOpen(false)
    }
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: 1100 }}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Stack spacing={0.5}>
            <Typography component="h2" variant="h5">
              {campaign.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {hasRange
                ? `${formatDate(campaign.startsAt)} to ${formatDate(campaign.endsAt)}`
                : 'No date range'}
              {' · '}
              {campaign.linkCount} links
            </Typography>
          </Stack>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => setDeleteOpen(true)}
            disabled={updating || deleting}
          >
            Delete
          </Button>
        </Stack>
      </Paper>

      <CampaignForm
        mode="edit"
        initialValues={initialValues}
        submitting={updating}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
      />

      <Paper sx={{ p: 2 }}>
        <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
          Links in this campaign
        </Typography>
        {campaign.shortLinks.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No links yet. Add links from the links list with the bulk toolbar,
            or pick this campaign when editing a link.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small" aria-label="Campaign links">
              <TableHead>
                <TableRow>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaign.shortLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <Link component={NextLink} href={`/links/${link.id}`}>
                        {link.shortUrl}
                      </Link>
                    </TableCell>
                    <TableCell>{link.name ?? ''}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-all' }}>
                      {link.to}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={link.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <StatsPanel
        campaignId={campaign.id}
        from={statsFrom}
        to={statsTo}
        csvFilename={`${campaign.name}-scans`}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this campaign?"
        description="Links in the campaign are kept; they just leave the campaign."
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </Stack>
  )
}
