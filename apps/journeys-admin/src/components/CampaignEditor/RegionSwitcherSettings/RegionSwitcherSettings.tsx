import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock as CampaignRegionSwitcherBlock } from '../../../../__generated__/GetCampaign'
import { CampaignSwitcherVariant } from '../../../../__generated__/globalTypes'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'

interface RegionSwitcherSettingsProps {
  block: CampaignRegionSwitcherBlock
}

/**
 * The Region Switcher's Settings: how it lists the regions — cards, a list or
 * pills. Picking one is one Command through `campaignRegionSwitcherBlockUpdate`;
 * undo writes the previous variant back.
 */
export function RegionSwitcherSettings({
  block
}: RegionSwitcherSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addFields, error } = useCampaignBlockFieldsCommand()

  function handleChange(variant: CampaignSwitcherVariant | null): void {
    if (variant == null || variant === block.switcherVariant) return
    addFields(block, { variant })
  }

  return (
    <Stack
      spacing={2}
      data-testid="RegionSwitcherSettings"
      data-block-id={block.id}
    >
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Typography variant="subtitle2">{t('Variant')}</Typography>
      <ToggleButtonGroup
        value={block.switcherVariant}
        exclusive
        fullWidth
        size="small"
        onChange={(_event, value: CampaignSwitcherVariant | null) =>
          handleChange(value)
        }
        aria-label={t('Variant')}
      >
        <ToggleButton value={CampaignSwitcherVariant.cards}>
          {t('Cards')}
        </ToggleButton>
        <ToggleButton value={CampaignSwitcherVariant.list}>
          {t('List')}
        </ToggleButton>
        <ToggleButton value={CampaignSwitcherVariant.pills}>
          {t('Pills')}
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}
