import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock as CampaignRegionSwitcherBlock } from '../../../../__generated__/GetCampaign'
import { CampaignSwitcherVariant } from '../../../../__generated__/globalTypes'
import {
  CampaignRegionSwitcherShowCountryNamesInput,
  useCampaignRegionSwitcherBlockShowCountryNamesMutation
} from '../../../libs/useCampaignRegionSwitcherBlockShowCountryNamesMutation'
import {
  CampaignRegionSwitcherVariantInput,
  useCampaignRegionSwitcherBlockVariantMutation
} from '../../../libs/useCampaignRegionSwitcherBlockVariantMutation'
import { useCampaignStyleCommand } from '../utils/useCampaignStyleCommand'

interface RegionSwitcherSettingsProps {
  block: CampaignRegionSwitcherBlock
}

/**
 * The Region Switcher's Settings: how it lists the regions — cards, a list or
 * pills — and whether its country chips show their names beside the flags.
 * Each change is one Command through `campaignRegionSwitcherBlockUpdate` on
 * this section alone; undo writes the previous value back.
 */
export function RegionSwitcherSettings({
  block
}: RegionSwitcherSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addStyle, error } = useCampaignStyleCommand()
  const writeVariant = useCampaignRegionSwitcherBlockVariantMutation()
  const writeShowCountryNames =
    useCampaignRegionSwitcherBlockShowCountryNamesMutation()

  function handleChange(variant: CampaignSwitcherVariant | null): void {
    if (variant == null || variant === block.switcherVariant) return
    addStyle<CampaignRegionSwitcherBlock, CampaignRegionSwitcherVariantInput>({
      block,
      input: { variant },
      previous: { variant: block.switcherVariant },
      run: writeVariant
    })
  }

  function handleShowCountryNamesChange(
    event: ChangeEvent<HTMLInputElement>
  ): void {
    addStyle<
      CampaignRegionSwitcherBlock,
      CampaignRegionSwitcherShowCountryNamesInput
    >({
      block,
      input: { showCountryNames: event.target.checked },
      previous: { showCountryNames: block.showCountryNames },
      run: writeShowCountryNames
    })
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
      <Typography variant="subtitle2">{t('Countries')}</Typography>
      <FormControlLabel
        control={
          <Switch
            checked={block.showCountryNames}
            onChange={handleShowCountryNamesChange}
          />
        }
        label={t('Show country names')}
        sx={{ alignSelf: 'flex-start' }}
      />
    </Stack>
  )
}
