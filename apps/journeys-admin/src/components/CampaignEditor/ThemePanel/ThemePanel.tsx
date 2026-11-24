import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  CAMPAIGN_THEME_PRESETS,
  PRESET_COLOR_COLUMNS,
  activeThemePreset
} from '@core/journeys/ui/Campaign'
import type {
  CampaignThemePresetColumn,
  CampaignThemePresetLabel,
  CampaignThemePresetName
} from '@core/journeys/ui/Campaign'
import {
  BODY_FONT_OPTIONS,
  HEADER_FONT_OPTIONS,
  LABELS_FONT_OPTIONS
} from '@core/shared/ui/fontFamilies'
import Header1Icon from '@core/shared/ui/icons/Header1'
import Type2Icon from '@core/shared/ui/icons/Type2'
import Type3Icon from '@core/shared/ui/icons/Type3'

import {
  CampaignRadius,
  ThemeMode
} from '../../../../__generated__/globalTypes'
import { FontSelect } from '../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography/ThemeBuilderDialog/ThemeSettings/FontSelect'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { ColourRows } from '../ColourRows'
import { useCampaignThemeCommand } from '../utils/useCampaignThemeCommand'

export const THEME_PRESET_NAMES: readonly CampaignThemePresetName[] = [
  'light',
  'dark'
]

export const RADIUS_OPTIONS = [
  CampaignRadius.square,
  CampaignRadius.slight,
  CampaignRadius.rounded,
  CampaignRadius.veryRounded
] as const

type FontColumn = 'headerFont' | 'bodyFont' | 'labelFont'

/** The four colours a preset swatch shows, the band colours first. */
const SWATCH_COLUMNS: readonly CampaignThemePresetColumn[] = [
  'backgroundColor',
  'surfaceColor',
  'primaryColor',
  'accentColor'
]

/**
 * The campaign Theme: the Light and Dark Theme Preset swatches, the
 * six base colours and the two contrast colours as swatch plus hex, the three
 * font selects over the journeys theme dialog's curated lists, the four
 * corner radii and the same four for the button corners. Every change is one Command
 * through `campaignThemeUpdate` with an optimistic response. The panel shows
 * Light, Dark or Custom by comparing the current values to the preset
 * constants; nothing is stored. A preset replaces the mode, the eight
 * colours and the button corners only; fonts, the corner radius and the
 * Palette stay.
 */
export function ThemePanel(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const theme = campaign.theme
  const { addTheme } = useCampaignThemeCommand()
  const active = activeThemePreset(theme)

  const presetLabels: Record<CampaignThemePresetLabel, string> = {
    light: t('Light'),
    dark: t('Dark'),
    custom: t('Custom')
  }
  const colourLabels: Record<CampaignThemePresetColumn, string> = {
    primaryColor: t('Primary'),
    accentColor: t('Accent'),
    backgroundColor: t('Background'),
    surfaceColor: t('Surface'),
    textColor: t('Text'),
    mutedColor: t('Muted'),
    contrastBackgroundColor: t('Contrast background'),
    contrastTextColor: t('Contrast text')
  }
  const radiusLabels: Record<CampaignRadius, string> = {
    square: t('Square'),
    slight: t('Slight'),
    rounded: t('Rounded'),
    veryRounded: t('Very rounded')
  }

  function handlePresetChange(
    _event: unknown,
    name: CampaignThemePresetName | null
  ): void {
    if (name == null || name === active) return
    const preset = CAMPAIGN_THEME_PRESETS[name]
    addTheme({
      themeMode: preset.themeMode as ThemeMode,
      primaryColor: preset.primaryColor,
      accentColor: preset.accentColor,
      backgroundColor: preset.backgroundColor,
      surfaceColor: preset.surfaceColor,
      textColor: preset.textColor,
      mutedColor: preset.mutedColor,
      contrastBackgroundColor: preset.contrastBackgroundColor,
      contrastTextColor: preset.contrastTextColor,
      buttonRadius: preset.buttonRadius as CampaignRadius
    })
  }

  function handleFontChange(column: FontColumn, font: string): void {
    const next = font === '' ? null : font
    if (next === theme[column]) return
    addTheme({ [column]: next })
  }

  function handleRadiusChange(
    _event: unknown,
    radius: CampaignRadius | null
  ): void {
    if (radius == null || radius === theme.radius) return
    addTheme({ radius })
  }

  function handleButtonRadiusChange(
    _event: unknown,
    buttonRadius: CampaignRadius | null
  ): void {
    if (buttonRadius == null || buttonRadius === theme.buttonRadius) return
    addTheme({ buttonRadius })
  }

  return (
    <Stack spacing={5} data-testid="CampaignThemePanel" data-preset={active}>
      <Typography
        variant="body2"
        color="text.secondary"
        data-testid="CampaignThemePreset"
      >
        {presetLabels[active]}
      </Typography>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Theme preset')}</Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={active === 'custom' ? null : active}
          onChange={handlePresetChange}
          aria-label={t('Theme preset')}
        >
          {THEME_PRESET_NAMES.map((name) => (
            <ToggleButton
              key={name}
              value={name}
              aria-label={presetLabels[name]}
              sx={{ py: 2 }}
            >
              <Stack spacing={1} sx={{ alignItems: 'center' }}>
                <Stack direction="row" spacing={0.5}>
                  {SWATCH_COLUMNS.map((column) => (
                    <Box
                      key={column}
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: CAMPAIGN_THEME_PRESETS[name][column],
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                  ))}
                </Stack>
                <Typography variant="caption">{presetLabels[name]}</Typography>
              </Stack>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Colours')}</Typography>
        <ColourRows
          label={t('Theme colours')}
          rows={PRESET_COLOR_COLUMNS.map((column) => ({
            key: column,
            label: colourLabels[column],
            value: theme[column],
            inherited: theme[column]
          }))}
          rowTestId="ThemeColour"
          pickerTestId="ThemeColourPicker"
          showIndicator={false}
          onCommit={(column, hex) => addTheme({ [column]: hex })}
        />
      </Stack>
      <Stack spacing={4}>
        <Typography variant="subtitle2">{t('Fonts')}</Typography>
        <FontSelect
          label={t('Header Text')}
          value={theme.headerFont ?? ''}
          options={[...HEADER_FONT_OPTIONS].sort()}
          onChange={(font) => handleFontChange('headerFont', font)}
          icon={<Header1Icon />}
          labelId="theme-header-font-select-label"
          selectId="theme-header-font-select"
          emptyLabel={t('Default')}
          helperText={t(
            'Used for large text elements like titles and headings.'
          )}
        />
        <FontSelect
          label={t('Body Text')}
          value={theme.bodyFont ?? ''}
          options={[...BODY_FONT_OPTIONS].sort()}
          onChange={(font) => handleFontChange('bodyFont', font)}
          icon={<Type2Icon />}
          labelId="theme-body-font-select-label"
          selectId="theme-body-font-select"
          emptyLabel={t('Default')}
          helperText={t(
            'Used for paragraphs, subheadings, and smaller content.'
          )}
        />
        <FontSelect
          label={t('Label Text')}
          value={theme.labelFont ?? ''}
          options={[...LABELS_FONT_OPTIONS].sort()}
          onChange={(font) => handleFontChange('labelFont', font)}
          icon={<Type3Icon />}
          labelId="theme-labels-font-select-label"
          selectId="theme-labels-font-select"
          emptyLabel={t('Default')}
          helperText={t('Used for buttons, forms, and interface elements.')}
        />
      </Stack>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Corner radius')}</Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={theme.radius}
          onChange={handleRadiusChange}
          aria-label={t('Corner radius')}
        >
          {RADIUS_OPTIONS.map((radius) => (
            <ToggleButton key={radius} value={radius}>
              {radiusLabels[radius]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Button corners')}</Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={theme.buttonRadius}
          onChange={handleButtonRadiusChange}
          aria-label={t('Button corners')}
        >
          {RADIUS_OPTIONS.map((buttonRadius) => (
            <ToggleButton key={buttonRadius} value={buttonRadius}>
              {radiusLabels[buttonRadius]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}
