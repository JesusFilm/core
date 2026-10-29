import Alert from '@mui/material/Alert'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock } from '../../../../__generated__/GetCampaign'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'

/** The slider moves in steps of five percent of the viewport height. */
export const HERO_MIN_HEIGHT_STEP = 5

interface HeroSettingsProps {
  /** The hero this editor edits. */
  block: CampaignHeroBlock
}

/**
 * The hero's Settings: a Height slider from Auto (as tall as the text) to
 * 100% of the screen, the same share on desktop and phone. The slider
 * follows the pointer while it is dragged and writes one Command through
 * `campaignHeroBlockUpdate` when it is released; undo writes the previous
 * value back, and a refused write shows the API's message.
 */
export function HeroSettings({ block }: HeroSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addFields, error } = useCampaignBlockFieldsCommand()
  const [value, setValue] = useState(block.minHeight ?? 0)

  useEffect(() => {
    setValue(block.minHeight ?? 0)
  }, [block.minHeight])

  function label(percent: number): string {
    return percent === 0 ? t('Auto') : `${percent}%`
  }

  function handleCommit(_event: unknown, next: number | number[]): void {
    const percent = Array.isArray(next) ? next[0] : next
    const minHeight = percent === 0 ? null : percent
    if (minHeight === block.minHeight) return
    addFields(block, { minHeight })
  }

  return (
    <Stack spacing={2} data-testid="HeroSettings" data-block-id={block.id}>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" id={`hero-height-${block.id}`}>
          {t('Height')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          data-testid="HeroHeightValue"
        >
          {label(value)}
        </Typography>
      </Stack>
      <Slider
        aria-labelledby={`hero-height-${block.id}`}
        value={value}
        min={0}
        max={100}
        step={HERO_MIN_HEIGHT_STEP}
        valueLabelDisplay="auto"
        valueLabelFormat={label}
        onChange={(_event, next) =>
          setValue(Array.isArray(next) ? next[0] : next)
        }
        onChangeCommitted={handleCommit}
        sx={{ mx: 1, width: 'auto' }}
      />
      <Typography variant="caption" color="text.secondary">
        {t(
          'The least of the screen the hero fills, with its text centred. Auto keeps it as tall as its text.'
        )}
      </Typography>
    </Stack>
  )
}
