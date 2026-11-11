import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock } from '../../../../__generated__/GetCampaign'
import { CommandError } from '../CommandError'
import { SliderRow } from '../SliderRow'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'

/** The slider moves in steps of five percent of the viewport height. */
const HERO_MIN_HEIGHT_STEP = 5

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
  function label(percent: number): string {
    return percent === 0 ? t('Auto') : `${percent}%`
  }

  function handleCommit(percent: number): void {
    const minHeight = percent === 0 ? null : percent
    if (minHeight === block.minHeight) return
    addFields(block, { minHeight })
  }

  return (
    <Stack spacing={2} data-testid="HeroSettings" data-block-id={block.id}>
      <CommandError error={error} />
      <SliderRow
        key={block.id}
        id={`hero-height-${block.id}`}
        label={t('Height')}
        value={block.minHeight ?? 0}
        min={0}
        max={100}
        step={HERO_MIN_HEIGHT_STEP}
        format={label}
        helperText={t(
          'The least of the screen the hero fills, with its text centred. Auto keeps it as tall as its text.'
        )}
        valueTestId="HeroHeightValue"
        onCommit={handleCommit}
      />
    </Stack>
  )
}
