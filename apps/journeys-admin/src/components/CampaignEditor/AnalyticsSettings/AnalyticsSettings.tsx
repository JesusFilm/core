import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignAnalyticsBlock as CampaignAnalyticsBlock } from '../../../../__generated__/GetCampaign'
import {
  CampaignAnalyticsShowMapInput,
  useCampaignAnalyticsBlockShowMapMutation
} from '../../../libs/useCampaignAnalyticsBlockShowMapMutation'
import { useCampaignStyleCommand } from '../utils/useCampaignStyleCommand'

interface AnalyticsSettingsProps {
  /** The Analytics section this editor edits. */
  block: CampaignAnalyticsBlock
}

/**
 * The Analytics section's Settings: the "Show map" switch. Flipping it is one
 * Command that writes `showMap` through `campaignAnalyticsBlockUpdate`, shown
 * at once on the canvas; undo writes the previous value back, and a refused
 * write shows the API's message.
 */
export function AnalyticsSettings({
  block
}: AnalyticsSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addStyle, error } = useCampaignStyleCommand()
  const writeShowMap = useCampaignAnalyticsBlockShowMapMutation()

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    addStyle<CampaignAnalyticsBlock, CampaignAnalyticsShowMapInput>({
      block,
      input: { showMap: event.target.checked },
      previous: { showMap: block.showMap },
      run: writeShowMap
    })
  }

  return (
    <Stack spacing={2} data-testid="AnalyticsSettings" data-block-id={block.id}>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Typography variant="subtitle2">{t('Map')}</Typography>
      <FormControlLabel
        control={<Switch checked={block.showMap} onChange={handleChange} />}
        label={t('Show map')}
        sx={{ alignSelf: 'flex-start' }}
      />
    </Stack>
  )
}
