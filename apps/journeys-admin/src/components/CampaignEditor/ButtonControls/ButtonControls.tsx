import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignButtonBlock as ButtonBlock } from '../../../../__generated__/GetCampaign'
import {
  ButtonSize,
  ButtonVariant
} from '../../../../__generated__/globalTypes'
import { AlignRow } from '../AlignRow'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { ColourRows } from '../ColourRows'
import { CommandError } from '../CommandError'
import { StyleRow } from '../StyleRow'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'
import { useCampaignHostBand } from '../utils/useCampaignHostBand'

export const BUTTON_VARIANTS = [
  ButtonVariant.contained,
  ButtonVariant.outlined,
  ButtonVariant.text
] as const

export const BUTTON_SIZES = [
  ButtonSize.small,
  ButtonSize.medium,
  ButtonSize.large
] as const

type ButtonColourField = 'color' | 'labelColor'

interface ButtonControlsProps {
  block: ButtonBlock
}

/**
 * The button Extra's inline rows: Variant (text, contained, outlined), Size
 * (small, medium, large), Align, and the fill `color` and `labelColor`, each
 * a hex or following the section. Align and the colours show whether they
 * follow the section and Reset back to it. One Command each.
 */
export function ButtonControls({ block }: ButtonControlsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addFields, error } = useCampaignBlockFieldsCommand()
  const band = useCampaignHostBand()

  const variantLabels: Record<ButtonVariant, string> = {
    contained: t('Contained'),
    outlined: t('Outlined'),
    text: t('Text')
  }
  const sizeLabels: Record<ButtonSize, string> = {
    small: t('Small'),
    medium: t('Medium'),
    large: t('Large')
  }
  const currentVariant = block.buttonVariant ?? ButtonVariant.contained
  const currentSize = block.size ?? ButtonSize.medium

  function handleVariant(_event: unknown, variant: ButtonVariant | null): void {
    if (variant == null || variant === currentVariant) return
    addFields(block, { variant })
  }

  function handleSize(_event: unknown, size: ButtonSize | null): void {
    if (size == null || size === currentSize) return
    addFields(block, { size })
  }

  return (
    <Stack spacing={4} data-testid="ButtonControls">
      <CommandError error={error} />
      <StyleRow label={t('Variant')}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={currentVariant}
          onChange={handleVariant}
          aria-label={t('Variant')}
        >
          {BUTTON_VARIANTS.map((variant) => (
            <ToggleButton key={variant} value={variant}>
              {variantLabels[variant]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </StyleRow>
      <StyleRow label={t('Size')}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={currentSize}
          onChange={handleSize}
          aria-label={t('Size')}
        >
          {BUTTON_SIZES.map((size) => (
            <ToggleButton key={size} value={size}>
              {sizeLabels[size]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </StyleRow>
      <AlignRow
        value={block.align}
        onChange={(align) => addFields(block, { align })}
      />
      <ColourRows<ButtonColourField>
        label={t('Colours')}
        rows={[
          {
            key: 'color',
            label: t('Button colour'),
            value: block.color,
            inherited: band?.button ?? campaign.theme.primaryColor
          },
          {
            key: 'labelColor',
            label: t('Button text colour'),
            value: block.labelColor,
            inherited: band?.buttonLabel ?? campaign.theme.surfaceColor
          }
        ]}
        rowTestId="ButtonColourRow"
        pickerTestId="ButtonColour"
        onCommit={(field, hex) => addFields(block, { [field]: hex })}
        onReset={(field) => addFields(block, { [field]: null })}
      />
    </Stack>
  )
}
