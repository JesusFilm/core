import TextField from '@mui/material/TextField'
import { useFormikContext } from 'formik'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import LinkAngled from '@core/shared/ui/icons/LinkAngled'

import { StrategySection } from '../../../../StrategySection'
import { TemplateSettingsFormValues } from '../../TemplateSettingsForm'

export function AboutTabPanel(): ReactElement {
  const { values, handleChange, errors } =
    useFormikContext<TemplateSettingsFormValues>()
  const { t } = useTranslation()
  return (
    <>
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
