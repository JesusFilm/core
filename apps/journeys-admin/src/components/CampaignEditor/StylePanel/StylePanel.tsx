import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo, useState } from 'react'

import { resolveBand } from '@core/journeys/ui/Campaign'
import X2Icon from '@core/shared/ui/icons/X2'

import { CampaignBackgroundKind } from '../../../../__generated__/globalTypes'
import {
  CampaignStyledBlock,
  SECTION_OVERRIDE_FIELDS,
  SectionOverrideField
} from '../../../libs/useCampaignSectionStyleMutation'
import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { PaletteColorPicker } from '../PaletteColorPicker'
import { useCampaignSectionStyleCommand } from '../utils/useCampaignSectionStyleCommand'

type StyleTab = 'background' | 'colours'

/** The kinds the Background tab offers; `image` arrives with the images ticket. */
export const BACKGROUND_KINDS = [
  CampaignBackgroundKind.none,
  CampaignBackgroundKind.surface,
  CampaignBackgroundKind.contrast,
  CampaignBackgroundKind.primary,
  CampaignBackgroundKind.custom
] as const

interface StylePanelProps {
  block: CampaignStyledBlock
  onClose?: () => void
}

/**
 * A section's Style: the Background tab sets the Section Background kind
 * and, for `custom`, its colour; the Colours tab sets the five overrides.
 * Every change is one Command through the section type's update mutation.
 * The custom colour and each override commit on picker blur; clearing an
 * override writes null. Only the pure hex rule is checked here; the API's
 * message is shown verbatim otherwise.
 */
export function StylePanel({ block, onClose }: StylePanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addSectionStyle, error } = useCampaignSectionStyleCommand()
  const [tab, setTab] = useState<StyleTab>('background')
  const [override, setOverride] = useState<SectionOverrideField>('headingColor')
  const band = useMemo(
    () => resolveBand(block, campaign.theme),
    [block, campaign.theme]
  )

  const kindLabels: Record<(typeof BACKGROUND_KINDS)[number], string> = {
    none: t('None'),
    surface: t('Surface'),
    contrast: t('Contrast'),
    primary: t('Primary'),
    custom: t('Custom')
  }
  const overrideLabels: Record<SectionOverrideField, string> = {
    headingColor: t('Heading'),
    textColor: t('Text'),
    buttonColor: t('Button'),
    buttonTextColor: t('Button text'),
    accentColor: t('Accent')
  }
  const bandValues: Record<SectionOverrideField, string> = {
    headingColor: band.heading,
    textColor: band.text,
    buttonColor: band.button,
    buttonTextColor: band.buttonLabel,
    accentColor: band.accent
  }

  function handleKindChange(
    _event: unknown,
    kind: CampaignBackgroundKind | null
  ): void {
    if (kind == null || kind === block.backgroundKind) return
    addSectionStyle(block, { backgroundKind: kind })
  }

  return (
    <Stack
      spacing={4}
      sx={{ p: 6, width: 360 }}
      data-testid="CampaignStylePanel"
      data-block-id={block.id}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{t('Style')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {blockLabel(t, block.__typename)}
          </Typography>
        </Box>
        {onClose != null && (
          <IconButton aria-label={t('Close')} onClick={onClose}>
            <X2Icon />
          </IconButton>
        )}
      </Stack>
      <Tabs
        value={tab}
        onChange={(_event, next: StyleTab) => setTab(next)}
        aria-label={t('Style')}
        variant="fullWidth"
      >
        <Tab value="background" label={t('Background')} />
        <Tab value="colours" label={t('Colours')} />
      </Tabs>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      {tab === 'background' && (
        <Stack spacing={4} role="tabpanel" data-testid="StyleBackgroundTab">
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={block.backgroundKind}
            onChange={handleKindChange}
            aria-label={t('Background')}
          >
            {BACKGROUND_KINDS.map((kind) => (
              <ToggleButton key={kind} value={kind}>
                {kindLabels[kind]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {block.backgroundKind === CampaignBackgroundKind.custom && (
            <PaletteColorPicker
              label={t('Custom colour')}
              value={block.backgroundColor}
              fallback={campaign.theme.backgroundColor}
              onCommit={(hex) =>
                addSectionStyle(block, { backgroundColor: hex })
              }
              testId="StyleBackgroundColor"
            />
          )}
        </Stack>
      )}
      {tab === 'colours' && (
        <Stack spacing={4} role="tabpanel" data-testid="StyleColoursTab">
          <List dense disablePadding aria-label={t('Colour overrides')}>
            {SECTION_OVERRIDE_FIELDS.map((field) => (
              <ListItemButton
                key={field}
                selected={override === field}
                onClick={() => setOverride(field)}
                data-testid={`StyleOverride-${field}`}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 3,
                    borderRadius: '50%',
                    bgcolor: block[field] ?? bandValues[field],
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
                <ListItemText
                  primary={overrideLabels[field]}
                  secondary={block[field] ?? t('Inherited')}
                />
              </ListItemButton>
            ))}
          </List>
          <PaletteColorPicker
            key={override}
            label={overrideLabels[override]}
            value={block[override]}
            fallback={bandValues[override]}
            onCommit={(hex) => addSectionStyle(block, { [override]: hex })}
            onClear={() => addSectionStyle(block, { [override]: null })}
            clearLabel={t('Inherit')}
            testId="StyleOverrideColor"
          />
        </Stack>
      )}
    </Stack>
  )
}
