'use client'

import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { PublishSummaryEntry, VideoPublishMode } from './publishAll.types'
import { PublishAllResultPanel } from './PublishAllResultPanel'

export function PublishAllDialogBody({
  unpublishedChildrenCount,
  allUnpublishedVariantsCount,
  isSubmitting,
  latestResult,
  onPublishVideosOnly,
  onDryRun,
  onPublishVideosAndLanguages,
  onClose
}: {
  unpublishedChildrenCount: number
  allUnpublishedVariantsCount: number
  isSubmitting: boolean
  latestResult: PublishSummaryEntry | null
  onPublishVideosOnly: () => void
  onDryRun: (mode: VideoPublishMode) => void | Promise<void>
  onPublishVideosAndLanguages: () => void
  onClose: () => void
}): ReactElement {
  const resultPanel =
    latestResult != null ? (
      <PublishAllResultPanel latestResult={latestResult} />
    ) : null
  const canPublishVideosOnly = unpublishedChildrenCount > 0
  const canPublishVideosAndLanguages =
    unpublishedChildrenCount > 0 || allUnpublishedVariantsCount > 0

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <Typography variant="body1">
        Choose a publish mode for this parent and its unpublished children.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        • <strong>Publish Videos Only</strong> (<code>childrenVideosOnly</code>
        ): publishes validated videos only (parent + unpublished children). No
        audio language variants are published.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        • <strong>Publish Videos and Audio Languages</strong> (
        <code>childrenVideosAndVariants</code>): publishes validated videos and
        all unpublished audio language variants attached to those videos.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Dry run previews counts and validation failures without writing to the
        database.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Current draft scope: {unpublishedChildrenCount} unpublished child
        video(s) and {allUnpublishedVariantsCount} unpublished variant(s).
      </Typography>

      <Stack spacing={1.5} sx={{ pt: 1 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Tooltip
            title={canPublishVideosOnly ? '' : 'No videos to publish'}
            describeChild
          >
            <span>
              <Button
                onClick={onPublishVideosOnly}
                color="primary"
                variant="outlined"
                disabled={isSubmitting || !canPublishVideosOnly}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Publish Videos Only
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title={canPublishVideosOnly ? '' : 'No videos to publish'}
            describeChild
          >
            <span>
              <Button
                onClick={() => void onDryRun('childrenVideosOnly')}
                color="primary"
                variant="text"
                disabled={isSubmitting || !canPublishVideosOnly}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Dry Run
              </Button>
            </span>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Tooltip
            title={
              canPublishVideosAndLanguages
                ? ''
                : 'No videos or audio languages to publish'
            }
            describeChild
          >
            <span>
              <Button
                onClick={onPublishVideosAndLanguages}
                color="primary"
                variant="contained"
                disabled={isSubmitting || !canPublishVideosAndLanguages}
                autoFocus
                sx={{ whiteSpace: 'nowrap' }}
              >
                Publish Videos and Audio Languages
              </Button>
            </span>
          </Tooltip>
          <Tooltip
            title={
              canPublishVideosAndLanguages
                ? ''
                : 'No videos or audio languages to publish'
            }
            describeChild
          >
            <span>
              <Button
                onClick={() => void onDryRun('childrenVideosAndVariants')}
                color="primary"
                variant="text"
                disabled={isSubmitting || !canPublishVideosAndLanguages}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Dry Run
              </Button>
            </span>
          </Tooltip>
        </Stack>

        <Stack direction="row" justifyContent="flex-end">
          <Button onClick={onClose} color="primary" variant="text">
            Cancel
          </Button>
        </Stack>
      </Stack>

      {resultPanel}
    </Stack>
  )
}
