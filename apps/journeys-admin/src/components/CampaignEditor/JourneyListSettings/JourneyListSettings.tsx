import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignJourneyListBlock as CampaignJourneyListBlock } from '../../../../__generated__/GetCampaign'
import { CampaignJourneyListDisplay } from '../../../../__generated__/globalTypes'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'

interface JourneyListSettingsProps {
  block: CampaignJourneyListBlock
}

/**
 * The Journey List's Settings: how it renders its items — a card grid or a
 * list. Picking one is one Command through `campaignJourneyListBlockUpdate`;
 * undo writes the previous display back.
 */
export function JourneyListSettings({
  block
}: JourneyListSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addFields, error } = useCampaignBlockFieldsCommand()

  function handleChange(display: CampaignJourneyListDisplay | null): void {
    if (display == null || display === block.display) return
    addFields(block, { display })
  }

  return (
    <Stack
      spacing={2}
      data-testid="JourneyListSettings"
      data-block-id={block.id}
    >
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Typography variant="subtitle2">{t('Display')}</Typography>
      <ToggleButtonGroup
        value={block.display}
        exclusive
        fullWidth
        size="small"
        onChange={(_event, value: CampaignJourneyListDisplay | null) =>
          handleChange(value)
        }
        aria-label={t('Display')}
      >
        <ToggleButton value={CampaignJourneyListDisplay.grid}>
          {t('Grid')}
        </ToggleButton>
        <ToggleButton value={CampaignJourneyListDisplay.list}>
          {t('List')}
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}
