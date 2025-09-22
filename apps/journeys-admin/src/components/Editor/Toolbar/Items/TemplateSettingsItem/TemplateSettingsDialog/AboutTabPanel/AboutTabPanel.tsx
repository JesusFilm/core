import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { StrategySection } from '@core/journeys/ui/StrategySection'
import LinkAngled from '@core/shared/ui/icons/LinkAngled'

import { ImageEdit } from '../../../../../Slider/Settings/Drawer/ImageEdit/ImageEdit'
import { useTemplateSettingsForm } from '../useTemplateSettingsForm'

import { CustomizeTemplate } from './CustomizeTemplate'

export function AboutTabPanel(): ReactElement {
  const { values, handleChange, errors } = useTemplateSettingsForm()
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
  )
}
