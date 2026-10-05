import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

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
import X2Icon from '@core/shared/ui/icons/X2'

import {
  CampaignButtonRadius,
  CampaignRadius,
  ThemeMode
} from '../../../../__generated__/globalTypes'
import { FontSelect } from '../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Typography/ThemeBuilderDialog/ThemeSettings/FontSelect'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { PaletteColorPicker } from '../PaletteColorPicker'
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

export const BUTTON_RADIUS_OPTIONS = [
  CampaignButtonRadius.rounded,
  CampaignButtonRadius.pill
] as const

type FontColumn = 'headerFont' | 'bodyFont' | 'labelFont'

/** The four colours a preset swatch shows, the band colours first. */
const SWATCH_COLUMNS: readonly CampaignThemePresetColumn[] = [
  'backgroundColor',
  'surfaceColor',
  'primaryColor',
  'accentColor'
]

interface ThemePanelProps {
  onClose?: () => void
}

/**
 * The campaign row's Theme: the Light and Dark Theme Preset swatches, the
 * six base colours and the two contrast colours as swatch plus hex, the three
 * font selects over the journeys theme dialog's curated lists, the four
 * corner radii and the two button shapes. Every change is one Command
 * through `campaignThemeUpdate` with an optimistic response. The panel shows
 * Light, Dark or Custom by comparing the current values to the preset
 * constants; nothing is stored. A preset replaces the mode and the eight
 * colours only; fonts, both radii and the Palette stay.
 */
export function ThemePanel({ onClose }: ThemePanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const theme = campaign.theme
  const { addTheme, error } = useCampaignThemeCommand()
  const [colour, setColour] =
    useState<CampaignThemePresetColumn>('primaryColor')
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
  const buttonRadiusLabels: Record<CampaignButtonRadius, string> = {
    rounded: t('Rounded'),
    pill: t('Pill')
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
      contrastTextColor: preset.contrastTextColor
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
    buttonRadius: CampaignButtonRadius | null
  ): void {
    if (buttonRadius == null || buttonRadius === theme.buttonRadius) return
    addTheme({ buttonRadius })
  }

  return (
    <Stack
      spacing={5}
      sx={{ p: 6, width: 360, overflowY: 'auto' }}
      data-testid="CampaignThemePanel"
      data-preset={active}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{t('Theme')}</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="CampaignThemePreset"
          >
            {presetLabels[active]}
          </Typography>
        </Box>
        {onClose != null && (
          <IconButton aria-label={t('Close')} onClick={onClose}>
            <X2Icon />
          </IconButton>
        )}
      </Stack>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
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
        <List dense disablePadding aria-label={t('Theme colours')}>
          {PRESET_COLOR_COLUMNS.map((column) => (
            <ListItemButton
              key={column}
              selected={colour === column}
              onClick={() => setColour(column)}
              data-testid={`ThemeColour-${column}`}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  mr: 3,
                  borderRadius: '50%',
                  bgcolor: theme[column],
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              />
              <ListItemText
                primary={colourLabels[column]}
                secondary={theme[column]}
              />
            </ListItemButton>
          ))}
        </List>
        <PaletteColorPicker
          key={colour}
          label={colourLabels[colour]}
          value={theme[colour]}
          onCommit={(hex) => addTheme({ [colour]: hex })}
          testId="ThemeColourPicker"
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
        <Typography variant="subtitle2">{t('Button shape')}</Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={theme.buttonRadius}
          onChange={handleButtonRadiusChange}
          aria-label={t('Button shape')}
        >
          {BUTTON_RADIUS_OPTIONS.map((buttonRadius) => (
            <ToggleButton key={buttonRadius} value={buttonRadius}>
              {buttonRadiusLabels[buttonRadius]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  )
}
