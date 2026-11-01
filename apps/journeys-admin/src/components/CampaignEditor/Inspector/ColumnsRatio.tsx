import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignColumnsBlock as ColumnsBlock } from '../../../../__generated__/GetCampaign'
import { CampaignColumnsRatio } from '../../../../__generated__/globalTypes'
import { useCampaignColumnsBlockRatioMutation } from '../../../libs/useCampaignColumnsBlockRatioMutation'
import { StyleRow } from '../StyleRow'
import {
  previousOf,
  useCampaignStyleCommand
} from '../utils/useCampaignStyleCommand'

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
  const { addStyle, error } = useCampaignStyleCommand()
  const [ratioUpdate] = useCampaignColumnsBlockRatioMutation()

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
    const input = { ratio }
    addStyle({
      block,
      input,
      previous: previousOf(block, input),
      run: async (current, next) =>
        await ratioUpdate({
          variables: { id: current.id, input: next },
          optimisticResponse: {
            campaignColumnsBlockUpdate: {
              __typename: 'CampaignColumnsBlock',
              id: current.id,
              ratio: next.ratio ?? current.ratio
            }
          }
        })
    })
  }

  return (
    <Stack spacing={4} data-testid="ColumnsRatio">
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
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
