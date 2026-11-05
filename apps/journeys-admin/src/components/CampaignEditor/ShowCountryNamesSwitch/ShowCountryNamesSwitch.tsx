import Alert from '@mui/material/Alert'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignRegionSwitcherBlock as CampaignRegionSwitcherBlock } from '../../../../__generated__/GetCampaign'
import {
  CampaignRegionSwitcherShowCountryNamesInput,
  useCampaignRegionSwitcherBlockShowCountryNamesMutation
} from '../../../libs/useCampaignRegionSwitcherBlockShowCountryNamesMutation'
import { useCampaignStyleCommand } from '../utils/useCampaignStyleCommand'

interface ShowCountryNamesSwitchProps {
  block: CampaignRegionSwitcherBlock
}

export function ShowCountryNamesSwitch({
  block
}: ShowCountryNamesSwitchProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addStyle, error } = useCampaignStyleCommand()
  const writeShowCountryNames =
    useCampaignRegionSwitcherBlockShowCountryNamesMutation()

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
    <>
      {error != null && <Alert severity="error">{error}</Alert>}
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
    </>
  )
}
