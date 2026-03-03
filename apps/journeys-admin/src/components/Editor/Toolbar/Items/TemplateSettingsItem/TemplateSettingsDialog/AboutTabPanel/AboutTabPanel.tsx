import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { QuickStartBadge } from '@core/journeys/ui/QuickStartBadge'
import { StrategySection } from '@core/journeys/ui/StrategySection'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'

import { ImageEdit } from '../../../../../Slider/Settings/Drawer/ImageEdit/ImageEdit'
import { useTemplateSettingsForm } from '../useTemplateSettingsForm'

import { CustomizeTemplate } from './CustomizeTemplate'

interface AboutTabPanelProps {
  showStrategySection?: boolean
}

export function AboutTabPanel({
  showStrategySection = false
}: AboutTabPanelProps): ReactElement {
  const { values, handleChange, errors, setFieldValue } =
    useTemplateSettingsForm()
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Stack direction="row" spacing={5}>
        <Box>
          <ImageEdit size="small" target="creator" variant="dialog" />
        </Box>
        <TextField
          id="creatorDescription"
          name="creatorDescription"
          value={values.creatorDescription}
          error={Boolean(errors?.creatorDescription)}
          variant="filled"
          helperText={
            errors?.creatorDescription != null
              ? errors?.creatorDescription
              : t(
                  'Public information about a person or a team created this journey'
                )
          }
          onChange={handleChange}
          label={t("Creator's Info")}
          multiline
          rows={2}
          sx={{ flex: 1 }}
        />
      </Stack>
      <Divider />
      <CustomizeTemplate />
      <Divider />
      <Box data-testid="QuickStartToggleSection">
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="subtitle1">
              {t('Show Quick Start label')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t(
                'Display a Quick Start badge on this template in the template gallery'
              )}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                data-testid="CustomizableToggle"
                checked={values.customizable ?? false}
                onChange={async (_event, checked) => {
                  await setFieldValue('customizable', checked)
                }}
              />
            }
            label=""
            sx={{ mr: 0 }}
          />
        </Stack>
        <Box
          sx={{
            mt: 4,
            opacity: values.customizable === true ? 1 : 0.3,
            transition: 'opacity 0.3s ease'
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1 }}
          >
            {t('Preview')}
          </Typography>
          <QuickStartBadge />
        </Box>
      </Box>
      {showStrategySection && (
        <>
          <TextField
            data-testid="StrategySlugEdit"
            id="strategySlug"
            name="strategySlug"
            value={values.strategySlug}
            error={Boolean(errors?.strategySlug)}
            variant="filled"
            helperText={
              errors?.strategySlug != null
                ? errors?.strategySlug
                : t('Embed web link from Google Slides or Canva')
            }
            onChange={handleChange}
            label={t('Paste URL here')}
            InputProps={{
              endAdornment: <LinkAngled sx={{ color: 'secondary.light' }} />
            }}
          />
          <StrategySection
            strategySlug={values.strategySlug}
            variant="placeholder"
            isError={Boolean(errors?.strategySlug)}
          />
        </>
      )}
    </>
  )
}
