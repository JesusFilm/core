import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'

import { GetCampaign_campaign_blocks_CampaignJourneyBlock as CampaignJourneyBlock } from '../../../../__generated__/GetCampaign'
import { campaignTextCap } from '../../../libs/useCampaignBlockTextMutation'
import { textLength } from '../Canvas/InlineText'
import { useCampaignTextCommand } from '../utils/useCampaignTextCommand'
import { useJourneyCardSnapshotRefreshCommand } from '../utils/useJourneyCardSnapshotRefreshCommand'

interface SnapshotFieldProps {
  block: CampaignJourneyBlock
  field: 'title' | 'description'
  label: string
  multiline?: boolean
}

/** One snapshot text of the card, typed into as the card's inline text is: one Command per edit. */
function SnapshotField({
  block,
  field,
  label,
  multiline = false
}: SnapshotFieldProps): ReactElement {
  const max = campaignTextCap(block.__typename, field)
  const { value, fallback, error, handleChange, handleFocus, handleBlur } =
    useCampaignTextCommand({ block, field })

  return (
    <TextField
      label={label}
      value={value}
      placeholder={fallback}
      onChange={(event) => handleChange(event.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      error={error != null}
      helperText={error ?? `${textLength(value)} / ${max}`}
      slotProps={{
        htmlInput: { maxLength: max },
        formHelperText: error != null ? { role: 'alert' } : undefined
      }}
      size="small"
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      fullWidth
    />
  )
}

interface JourneyCardSettingsProps {
  block: CampaignJourneyBlock
}

/**
 * A journey card's snapshot: the title and description it took from its
 * journey, edited here or in place on the canvas, and Refresh from journey,
 * which replaces them with the journey's current text.
 */
export function JourneyCardSettings({
  block
}: JourneyCardSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { refreshSnapshot, confirmDialog } =
    useJourneyCardSnapshotRefreshCommand()

  return (
    <Stack
      spacing={2}
      data-testid="JourneyCardSettings"
      data-block-id={block.id}
    >
      <Typography variant="subtitle2">{t('Snapshot')}</Typography>
      <SnapshotField block={block} field="title" label={t('Title')} />
      <SnapshotField
        block={block}
        field="description"
        label={t('Description')}
        multiline
      />
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<ArrowRefresh6Icon />}
        onClick={() => {
          void refreshSnapshot(block)
        }}
        sx={{ alignSelf: 'flex-start' }}
      >
        {t('Refresh from journey')}
      </Button>
      {confirmDialog}
    </Stack>
  )
}
