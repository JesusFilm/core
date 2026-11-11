import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignTypographyBlock as TypographyBlock } from '../../../../__generated__/GetCampaign'
import { TypographyVariant } from '../../../../__generated__/globalTypes'
import { AlignRow } from '../AlignRow'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { ColourRows } from '../ColourRows'
import { CommandError } from '../CommandError'
import { StyleRow } from '../StyleRow'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'
import { useCampaignHostBand } from '../utils/useCampaignHostBand'

/** The twelve variants Size walks, largest first. */
export const TEXT_SIZES = [
  TypographyVariant.h1,
  TypographyVariant.h2,
  TypographyVariant.h3,
  TypographyVariant.h4,
  TypographyVariant.h5,
  TypographyVariant.h6,
  TypographyVariant.subtitle1,
  TypographyVariant.subtitle2,
  TypographyVariant.body1,
  TypographyVariant.body2,
  TypographyVariant.caption,
  TypographyVariant.overline
] as const

/** The sizes a section's heading colour applies to; the rest take its text colour. */
const HEADING_SIZES: ReadonlySet<TypographyVariant> = new Set(
  TEXT_SIZES.slice(0, 6)
)

interface TextControlsProps {
  block: TypographyBlock
}

/**
 * The text Extra's inline rows: Size walks the twelve typography variants,
 * Align sets left, center or right, Colour sets a hex through the palette
 * picker. Align and Colour show whether they follow the section and Reset
 * back to it. One Command each.
 */
export function TextControls({ block }: TextControlsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addFields, error } = useCampaignBlockFieldsCommand()
  const band = useCampaignHostBand()

  const sizeLabels: Record<TypographyVariant, string> = {
    h1: t('Heading 1'),
    h2: t('Heading 2'),
    h3: t('Heading 3'),
    h4: t('Heading 4'),
    h5: t('Heading 5'),
    h6: t('Heading 6'),
    subtitle1: t('Subtitle 1'),
    subtitle2: t('Subtitle 2'),
    body1: t('Body 1'),
    body2: t('Body 2'),
    caption: t('Caption'),
    overline: t('Overline')
  }
  const currentSize = block.typographyVariant ?? TypographyVariant.body1
  const inheritedColour =
    (HEADING_SIZES.has(currentSize) ? band?.heading : band?.text) ??
    campaign.theme.textColor

  function handleSize(event: ChangeEvent<HTMLInputElement>): void {
    const variant = event.target.value as TypographyVariant
    if (variant === currentSize) return
    addFields(block, { variant })
  }

  return (
    <Stack spacing={4} data-testid="TextControls">
      <CommandError error={error} />
      <StyleRow label={t('Size')}>
        <TextField
          select
          size="small"
          fullWidth
          value={currentSize}
          onChange={handleSize}
          slotProps={{
            select: { native: true },
            htmlInput: { 'aria-label': t('Size') }
          }}
        >
          {TEXT_SIZES.map((variant) => (
            <option key={variant} value={variant}>
              {sizeLabels[variant]}
            </option>
          ))}
        </TextField>
      </StyleRow>
      <AlignRow
        value={block.align}
        onChange={(align) => addFields(block, { align })}
      />
      <ColourRows
        label={t('Colour')}
        rows={[
          {
            key: 'color',
            label: t('Text colour'),
            value: block.color,
            inherited: inheritedColour
          }
        ]}
        rowTestId="TextColourRow"
        pickerTestId="TextColour"
        onCommit={(_key, hex) => addFields(block, { color: hex })}
        onReset={() => addFields(block, { color: null })}
      />
    </Stack>
  )
}
