import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import LinkAngled from '@core/shared/ui/icons/LinkAngled'

import { StrategySection } from '../../../../../StrategySection'
import { ImageEdit } from '../../../../Drawer/SocialShareAppearance/ImageEdit/ImageEdit'
import { useTemplateSettingsForm } from '../useTemplateSettingsForm'

export function AboutTabPanel(): ReactElement {
  const { values, handleChange, errors } = useTemplateSettingsForm()
  const { t } = useTranslation()
  return (
    <>
      <Stack direction="row" spacing={5}>
        <ImageEdit size="small" target="creator" variant="dialog" />
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
          rows={3}
          sx={{ flex: 1 }}
        />
      </Stack>
      <Divider />
      <TextField
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
