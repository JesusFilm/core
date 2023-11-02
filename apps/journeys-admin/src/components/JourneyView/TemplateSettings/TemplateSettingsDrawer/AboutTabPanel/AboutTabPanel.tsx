import TextField from '@mui/material/TextField'
import { useFormikContext } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import LinkAngled from '@core/shared/ui/icons/LinkAngled'

import { ImageEdit } from '../../../../Editor/Drawer/SocialShareAppearance/ImageEdit/ImageEdit'
import { StrategySection } from '../../../../StrategySection'
import { TemplateSettingsFormValues } from '../../TemplateSettingsForm'

export function AboutTabPanel(): ReactElement {
  const { values, handleChange, errors } =
    useFormikContext<TemplateSettingsFormValues>()
  const { t } = useTranslation()
  return (
    <>
      <ImageEdit />
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
      />
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
