'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { ReactElement, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { SelectField, TextField } from '../../../../../components/form'
import {
  GET_SHORT_LINK_CAMPAIGN_OPTIONS,
  SHORT_LINK_FIELDS,
  isMutationError,
  parseMutationError
} from '../../../../../libs/shortLink'
import { notify, notifyError } from '../../../../../libs/toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle
} from '@/components/ui/dialog'

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
        notify(parseMutationError(outcome).message, 'error')
        return
      }
      notify(successMessage, 'success')
      setAction(null)
      setValue('')
      onDone()
    } catch (error) {
      notifyError(error, 'Bulk update failed')
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

  function handleOpenChange(open: boolean): void {
    if (!open) setAction(null)
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
    <div
      data-testid="BulkToolbar"
      className="flex flex-wrap items-center gap-2 px-4 pb-2"
    >
      <span className="me-2 text-sm">{selectedIds.length} selected</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePause}
        disabled={loading}
      >
        Pause
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleActivate}
        disabled={loading}
      >
        Activate
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleOpen('addTag')}>
        Add tag
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpen('removeTag')}
      >
        Remove tag
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpen('addCampaign')}
      >
        Add to campaign
      </Button>
      <Dialog open={action != null} onOpenChange={handleOpenChange}>
        <DialogPopup className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action != null ? ACTION_TITLES[action] : ''}
            </DialogTitle>
          </DialogHeader>
          <DialogPanel>
            {action === 'addCampaign' ? (
              <SelectField
                id="bulk-campaign"
                label="Campaign"
                value={value}
                onValueChange={setValue}
                placeholder="Choose a campaign"
                options={campaigns.map((campaign) => ({
                  value: campaign.id,
                  label: campaign.name
                }))}
              />
            ) : (
              <TextField
                id="bulk-tag"
                label="Tag"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                autoFocus
              />
            )}
          </DialogPanel>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={value.trim() === ''}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  )
}
