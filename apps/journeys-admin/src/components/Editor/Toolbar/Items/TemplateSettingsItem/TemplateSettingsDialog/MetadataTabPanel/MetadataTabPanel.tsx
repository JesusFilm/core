import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { format, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { useTemplateSettingsForm } from '../useTemplateSettingsForm'

export function MetadataTabPanel(): ReactElement {
  const { values, handleChange, setFieldValue } = useTemplateSettingsForm()
  const { data, loading } = useLanguagesQuery({ languageId: '529' })
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  async function handleOnChange(value: LanguageOption): Promise<void> {
    const { id } = value
    await setFieldValue('languageId', id)
  }

  const language = data?.languages.find(({ id }) => id === values.languageId)
  const languageValue: LanguageOption = {
    id: language?.id ?? '',
    localName: language?.name?.find(({ primary }) => !primary)?.value,
    nativeName: language?.name?.find(({ primary }) => primary)?.value
  }

  return (
    <>
      <TextField
        label={t('Title')}
        id="title"
        name="title"
        fullWidth
        value={values.title}
        variant="filled"
        onChange={handleChange}
        helperText={t('Recommended length: six words or shorter')}
      />
      <TextField
        label={t('Description')}
        id="description"
        name="description"
        fullWidth
        value={values.description}
        multiline
        variant="filled"
        rows={3}
        onChange={handleChange}
        helperText={t('Publicly visible on template details page')}
      />
      <LanguageAutocomplete
        onChange={handleOnChange}
        value={languageValue}
        languages={data?.languages}
        loading={loading}
        helperText={t('RTL languages will change the journey flow')}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                sx={{ mr: 1 }}
                color="secondary"
                defaultChecked={values.featured}
                onChange={handleChange}
                value={values.featured}
                name="featured"
              />
            }
            componentsProps={{
              typography: { color: 'secondary.main', variant: 'subtitle2' }
            }}
            label={t('Featured')}
          />
        </FormGroup>
        {journey?.publishedAt != null && (
          <TextField
            hiddenLabel
            variant="filled"
            value={format(parseISO(journey?.publishedAt as string), 'P')}
            InputProps={{
              readOnly: true
            }}
          />
        )}
      </Stack>
    </>
  )
}
