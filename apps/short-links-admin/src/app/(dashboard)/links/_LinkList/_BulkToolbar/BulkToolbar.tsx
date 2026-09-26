'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import {
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  SHORT_LINK_FIELDS,
  isMutationError,
  parseMutationError
} from '../../../../../libs/shortLink'

export const SHORT_LINK_BULK_UPDATE = graphql(
  `
    mutation ShortLinkBulkUpdate($input: MutationShortLinkBulkUpdateInput!) {
      shortLinkBulkUpdate(input: $input) {
        __typename
        ... on MutationShortLinkBulkUpdateSuccess {
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

type BulkAction = 'addTag' | 'removeTag' | 'addCampaign'

interface BulkToolbarProps {
  selectedIds: string[]
  onDone: () => void
}

const ACTION_TITLES: Record<BulkAction, string> = {
  addTag: 'Add tag',
  removeTag: 'Remove tag',
  addCampaign: 'Add to campaign'
}

export function BulkToolbar({
  selectedIds,
  onDone
}: BulkToolbarProps): ReactElement | null {
  const { enqueueSnackbar } = useSnackbar()
  const [action, setAction] = useState<BulkAction | null>(null)
  const [value, setValue] = useState('')
  const [bulkUpdate, { loading }] = useMutation(SHORT_LINK_BULK_UPDATE)
  const { data: campaignData } = useQuery(GET_SHORT_LINK_CAMPAIGN_OPTIONS, {
    skip: action !== 'addCampaign'
  })

  if (selectedIds.length === 0) return null

  const campaigns =
    campaignData?.shortLinkCampaigns.edges?.flatMap((edge) =>
      edge?.node != null ? [edge.node] : []
    ) ?? []

  async function run(
    input: Omit<
      NonNullable<Parameters<typeof bulkUpdate>[0]>['variables']['input'],
      'ids'
    >,
    successMessage: string
  ): Promise<void> {
    try {
      const { data } = await bulkUpdate({
        variables: { input: { ids: selectedIds, ...input } }
      })
      const outcome = data?.shortLinkBulkUpdate
      if (outcome != null && isMutationError(outcome)) {
        enqueueSnackbar(parseMutationError(outcome).message, {
          variant: 'error'
        })
        return
      }
      enqueueSnackbar(successMessage, { variant: 'success' })
      setAction(null)
      setValue('')
      onDone()
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Bulk update failed',
        { variant: 'error' }
      )
    }
  }

  function handlePause(): void {
    void run({ status: 'paused' }, `Paused ${selectedIds.length} links`)
  }

  function handleActivate(): void {
    void run({ status: 'active' }, `Activated ${selectedIds.length} links`)
  }

  function handleOpen(next: BulkAction): void {
    setValue('')
    setAction(next)
  }

  function handleClose(): void {
    setAction(null)
  }

  function handleSubmit(): void {
    if (action == null || value.trim() === '') return
    const count = selectedIds.length
    if (action === 'addTag') {
      void run({ addTags: [value.trim()] }, `Tagged ${count} links`)
      return
    }
    if (action === 'removeTag') {
      void run({ removeTags: [value.trim()] }, `Untagged ${count} links`)
      return
    }
    void run({ addCampaignIds: [value] }, `Added ${count} links to campaign`)
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', px: 2, pb: 1, flexWrap: 'wrap' }}
      data-testid="BulkToolbar"
    >
      <Typography variant="body2" sx={{ mr: 1 }}>
        {selectedIds.length} selected
      </Typography>
      <Button size="small" onClick={handlePause} disabled={loading}>
        Pause
      </Button>
      <Button size="small" onClick={handleActivate} disabled={loading}>
        Activate
      </Button>
      <Button size="small" onClick={() => handleOpen('addTag')}>
        Add tag
      </Button>
      <Button size="small" onClick={() => handleOpen('removeTag')}>
        Remove tag
      </Button>
      <Button size="small" onClick={() => handleOpen('addCampaign')}>
        Add to campaign
      </Button>
      <Dialog open={action != null} onClose={handleClose} fullWidth>
        <DialogTitle>{action != null ? ACTION_TITLES[action] : ''}</DialogTitle>
        <DialogContent>
          {action === 'addCampaign' ? (
            <TextField
              select
              fullWidth
              label="Campaign"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              sx={{ mt: 1 }}
            >
              {campaigns.map((campaign) => (
                <MenuItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              autoFocus
              fullWidth
              label="Tag"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            loading={loading}
            disabled={value.trim() === ''}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
