import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useState } from 'react'

import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import PaletteIcon from '@core/shared/ui/icons/Palette'
import Type1Icon from '@core/shared/ui/icons/Type1'

import { GetCampaign_campaign_blocks_CampaignTypographyBlock as TypographyBlock } from '../../../../__generated__/GetCampaign'
import {
  TypographyAlign,
  TypographyVariant
} from '../../../../__generated__/globalTypes'
import { BarButton } from '../BarButton'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { PaletteColorPicker } from '../PaletteColorPicker'
import { useCampaignExtraStyleCommand } from '../utils/useCampaignExtraStyleCommand'

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

export const TEXT_ALIGNS = [
  TypographyAlign.left,
  TypographyAlign.center,
  TypographyAlign.right
] as const

type Control = 'size' | 'align' | 'colour'

interface TextControlsProps {
  block: TypographyBlock
}

/**
 * The text Extra's bar controls: Size walks the twelve typography variants,
 * Align sets left, center or right (or follows the section), Colour sets a
 * hex through the palette picker (or follows the section). One Command each.
 */
export function TextControls({ block }: TextControlsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addTextStyle, error } = useCampaignExtraStyleCommand()
  const [open, setOpen] = useState<{
    control: Control
    anchor: HTMLElement
  } | null>(null)

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
  const alignLabels: Record<TypographyAlign, string> = {
    left: t('Left'),
    center: t('Center'),
    right: t('Right')
  }
  const currentSize = block.typographyVariant ?? TypographyVariant.body1

  function openControl(control: Control) {
    return (event: MouseEvent<HTMLButtonElement>) =>
      setOpen({ control, anchor: event.currentTarget })
  }

  function close(): void {
    setOpen(null)
  }

  function handleSize(variant: TypographyVariant): void {
    close()
    if (variant === currentSize) return
    addTextStyle(block, { variant })
  }

  function handleAlign(align: TypographyAlign | null): void {
    close()
    if (align === block.align) return
    addTextStyle(block, { align })
  }

  const menuOrigin = {
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'bottom', horizontal: 'left' }
  } as const

  return (
    <>
      <BarButton
        label={t('Size')}
        icon={<Type1Icon />}
        onClick={openControl('size')}
        active={open?.control === 'size'}
      />
      <BarButton
        label={t('Align')}
        icon={<AlignCenterIcon />}
        onClick={openControl('align')}
        active={open?.control === 'align'}
      />
      <BarButton
        label={t('Colour')}
        icon={<PaletteIcon />}
        onClick={openControl('colour')}
        active={open?.control === 'colour'}
      />
      <Menu
        anchorEl={open?.anchor}
        open={open?.control === 'size'}
        onClose={close}
        {...menuOrigin}
        data-testid="TextSizeMenu"
      >
        {TEXT_SIZES.map((variant) => (
          <MenuItem
            key={variant}
            selected={variant === currentSize}
            onClick={() => handleSize(variant)}
          >
            {sizeLabels[variant]}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={open?.anchor}
        open={open?.control === 'align'}
        onClose={close}
        {...menuOrigin}
        data-testid="TextAlignMenu"
      >
        {TEXT_ALIGNS.map((align) => (
          <MenuItem
            key={align}
            selected={align === block.align}
            onClick={() => handleAlign(align)}
          >
            {alignLabels[align]}
          </MenuItem>
        ))}
        <MenuItem
          selected={block.align == null}
          onClick={() => handleAlign(null)}
        >
          {t('Follow section')}
        </MenuItem>
      </Menu>
      <Popover
        anchorEl={open?.anchor}
        open={open?.control === 'colour'}
        onClose={close}
        {...menuOrigin}
        data-testid="TextColourPopover"
      >
        <Stack spacing={3} sx={{ p: 4, width: 320 }}>
          {error != null && (
            <Alert severity="error" role="alert">
              {error}
            </Alert>
          )}
          <PaletteColorPicker
            label={t('Text colour')}
            value={block.color}
            fallback={campaign.theme.textColor}
            onCommit={(hex) => addTextStyle(block, { color: hex })}
            testId="TextColour"
          />
          <Button
            size="small"
            color="secondary"
            disabled={block.color == null}
            onClick={() => addTextStyle(block, { color: null })}
          >
            {t('Follow section')}
          </Button>
        </Stack>
      </Popover>
    </>
  )
}
