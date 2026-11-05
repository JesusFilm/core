'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { Trash2Icon } from 'lucide-react'
import NextLink from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
import { notify, notifyError } from '../../../../../libs/toast'
import { CampaignForm, CampaignFormValues } from '../../_CampaignForm'
import { toCampaignInput } from '../../new/_NewCampaign'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

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

  if (loading) return <Spinner aria-label="Loading campaign" />
  if (error != null)
    return (
      <Alert variant="error">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  const result = data?.shortLinkCampaign
  if (result == null || result.__typename !== 'QueryShortLinkCampaignSuccess') {
    return (
      <Alert variant="error">
        <AlertDescription>
          {result != null && 'message' in result && result.message != null
            ? result.message
            : 'Campaign not found'}
        </AlertDescription>
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
      notify('Campaign saved', 'success')
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
        notify(parseMutationError(outcome).message, 'error')
        return
      }
      notify('Campaign deleted', 'success')
      router.push('/campaigns')
    } catch (caught) {
      notifyError(caught, 'Delete failed')
    } finally {
      setDeleteOpen(false)
    }
  }

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <Card>
        <CardPanel className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{campaign.name}</h2>
            <span className="text-muted-foreground text-xs">
              {hasRange
                ? `${formatDate(campaign.startsAt)} to ${formatDate(campaign.endsAt)}`
                : 'No date range'}
              {' · '}
              {campaign.linkCount} links
            </span>
          </div>
          <Button
            variant="destructive-outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={updating || deleting}
          >
            <Trash2Icon aria-hidden="true" />
            Delete
          </Button>
        </CardPanel>
      </Card>

      <CampaignForm
        mode="edit"
        initialValues={initialValues}
        submitting={updating}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
      />

      <Card>
        <CardPanel className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Links in this campaign</h3>
          {campaign.shortLinks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No links yet. Add links from the links list with the bulk toolbar,
              or pick this campaign when editing a link.
            </p>
          ) : (
            <Table aria-label="Campaign links">
              <TableHeader>
                <TableRow>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.shortLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <NextLink
                        href={`/links/${link.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {link.shortUrl}
                      </NextLink>
                    </TableCell>
                    <TableCell>{link.name ?? ''}</TableCell>
                    <TableCell className="break-all">{link.to}</TableCell>
                    <TableCell>
                      <StatusChip status={link.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardPanel>
      </Card>

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
    </div>
  )
}
