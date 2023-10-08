import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { FormikErrors, FormikValues } from 'formik'
import { ChangeEvent, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import LinkAngled from '@core/shared/ui/icons/LinkAngled'
import { TabPanel } from '@core/shared/ui/TabPanel'

import { StrategySection } from '../../../../TemplateView/StrategySection'

interface CaseStudyTabPanelProps {
  name: string
  value: FormikValues[string]
  errors: FormikErrors<FormikValues>
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  tabValue: number
}

export function CaseStudyTabPanel({
  name,
  value,
  errors,
  onChange,
  tabValue
}: CaseStudyTabPanelProps): ReactElement {
  const { t } = useTranslation()
  return (
    <TabPanel name="template-about-settings" value={tabValue} index={2}>
      <Stack sx={{ pt: 6 }} gap={6}>
        <TextField
          id={name}
          name={name}
          value={value}
          error={Boolean(errors?.strategySlug)}
          variant="filled"
          helperText={
            errors?.strategySlug != null
              ? (errors?.strategySlug as string)
              : t('Embed web link from Google Slides or Canva')
          }
          onChange={onChange}
          label={t('Paste URL here')}
          InputProps={{
            endAdornment: <LinkAngled sx={{ color: 'secondary.light' }} />
          }}
        />
        <StrategySection
          strategySlug={value}
          variant="preview"
          isError={Boolean(errors?.strategySlug)}
        />
      </Stack>
    </TabPanel>
  )
}
