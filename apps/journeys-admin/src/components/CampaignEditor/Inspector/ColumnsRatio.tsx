import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignColumnsBlock as ColumnsBlock } from '../../../../__generated__/GetCampaign'
import { CampaignColumnsRatio } from '../../../../__generated__/globalTypes'
import { CommandError } from '../CommandError'
import { StyleRow } from '../StyleRow'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'

/** The Columns section's width ratios, in the order the toggle lists them. */
export const COLUMNS_RATIOS = [
  CampaignColumnsRatio.equal,
  CampaignColumnsRatio.wideLeft,
  CampaignColumnsRatio.wideRight
] as const

interface ColumnsRatioProps {
  block: ColumnsBlock
}

/**
 * A Columns section's Ratio: equal, wide left or wide right. One Command
 * through the columns update; the canvas grid follows the block.
 */
export function ColumnsRatio({ block }: ColumnsRatioProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addFields, error } = useCampaignBlockFieldsCommand()

  const labels: Record<CampaignColumnsRatio, string> = {
    equal: t('Equal'),
    wideLeft: t('Wide left'),
    wideRight: t('Wide right')
  }

  function handleChange(
    _event: unknown,
    ratio: CampaignColumnsRatio | null
  ): void {
    if (ratio == null || ratio === block.ratio) return
    addFields(block, { ratio })
  }

  return (
    <Stack spacing={4} data-testid="ColumnsRatio">
      <CommandError error={error} />
      <StyleRow label={t('Ratio')}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={block.ratio}
          onChange={handleChange}
          aria-label={t('Ratio')}
        >
          {COLUMNS_RATIOS.map((ratio) => (
            <ToggleButton key={ratio} value={ratio}>
              {labels[ratio]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </StyleRow>
    </Stack>
  )
}
