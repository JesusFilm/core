import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useState } from 'react'

import PaletteIcon from '@core/shared/ui/icons/Palette'
import Type1Icon from '@core/shared/ui/icons/Type1'

import { GetCampaign_campaign_blocks_CampaignButtonBlock as ButtonBlock } from '../../../../__generated__/GetCampaign'
import {
  ButtonSize,
  ButtonVariant
} from '../../../../__generated__/globalTypes'
import { BarButton } from '../BarButton'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { PaletteColorPicker } from '../PaletteColorPicker'
import { useCampaignExtraStyleCommand } from '../utils/useCampaignExtraStyleCommand'

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

type Control = 'variant' | 'size' | 'colours'

interface ButtonControlsProps {
  block: ButtonBlock
}

/**
 * The button Extra's bar controls: Variant (text, contained, outlined),
 * Size (small, medium, large) and Colours (the fill `color` and the label
 * `labelColor`, each a hex or following the section). One Command each.
 */
export function ButtonControls({ block }: ButtonControlsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addButtonStyle, error } = useCampaignExtraStyleCommand()
  const [open, setOpen] = useState<{
    control: Control
    anchor: HTMLElement
  } | null>(null)

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

  function openControl(control: Control) {
    return (event: MouseEvent<HTMLButtonElement>) =>
      setOpen({ control, anchor: event.currentTarget })
  }

  function close(): void {
    setOpen(null)
  }

  function handleVariant(variant: ButtonVariant): void {
    close()
    if (variant === currentVariant) return
    addButtonStyle(block, { variant })
  }

  function handleSize(size: ButtonSize): void {
    close()
    if (size === currentSize) return
    addButtonStyle(block, { size })
  }

  const menuOrigin = {
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'bottom', horizontal: 'left' }
  } as const

  return (
    <>
      <BarButton
        label={t('Variant')}
        icon={<Type1Icon />}
        onClick={openControl('variant')}
        active={open?.control === 'variant'}
      />
      <BarButton
        label={t('Size')}
        icon={<Type1Icon />}
        onClick={openControl('size')}
        active={open?.control === 'size'}
      />
      <BarButton
        label={t('Colours')}
        icon={<PaletteIcon />}
        onClick={openControl('colours')}
        active={open?.control === 'colours'}
      />
      <Menu
        anchorEl={open?.anchor}
        open={open?.control === 'variant'}
        onClose={close}
        {...menuOrigin}
        data-testid="ButtonVariantMenu"
      >
        {BUTTON_VARIANTS.map((variant) => (
          <MenuItem
            key={variant}
            selected={variant === currentVariant}
            onClick={() => handleVariant(variant)}
          >
            {variantLabels[variant]}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={open?.anchor}
        open={open?.control === 'size'}
        onClose={close}
        {...menuOrigin}
        data-testid="ButtonSizeMenu"
      >
        {BUTTON_SIZES.map((size) => (
          <MenuItem
            key={size}
            selected={size === currentSize}
            onClick={() => handleSize(size)}
          >
            {sizeLabels[size]}
          </MenuItem>
        ))}
      </Menu>
      <Popover
        anchorEl={open?.anchor}
        open={open?.control === 'colours'}
        onClose={close}
        {...menuOrigin}
        data-testid="ButtonColoursPopover"
      >
        <Stack spacing={4} sx={{ p: 4, width: 320 }}>
          {error != null && (
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          )}
          <PaletteColorPicker
            label={t('Button colour')}
            value={block.color}
            fallback={campaign.theme.primaryColor}
            onCommit={(hex) => addButtonStyle(block, { color: hex })}
            onClear={() => addButtonStyle(block, { color: null })}
            clearLabel={t('Follow section')}
            testId="ButtonColour"
          />
          <Divider />
          <PaletteColorPicker
            label={t('Button text colour')}
            value={block.labelColor}
            fallback={campaign.theme.surfaceColor}
            onCommit={(hex) => addButtonStyle(block, { labelColor: hex })}
            onClear={() => addButtonStyle(block, { labelColor: null })}
            clearLabel={t('Follow section')}
            testId="ButtonLabelColour"
          />
          <Button size="small" color="secondary" onClick={close}>
            {t('Done')}
          </Button>
        </Stack>
      </Popover>
    </>
  )
}
