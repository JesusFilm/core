import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { format, parseISO } from 'date-fns'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { useLanguagesQuery } from '../../../../../../libs/useLanguagesQuery'
import { useTemplateSettingsForm } from '../useTemplateSettingsForm'

export function MetadataTabPanel(): ReactElement {
  const { values, handleChange, setFieldValue } = useTemplateSettingsForm()
  const { data, loading } = useLanguagesQuery({ languageId: '529' })
  const { journey } = useJourney()
  const { t } = useTranslation()

  const handleOnChange = async (value): Promise<void> => {
    const { id } = value
    await setFieldValue('languageId', id)
  }

  const language = data?.languages.find(({ id }) => id === values.languageId)
  const languageValue = {
    id: language?.id,
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
        onChange={async (value) => await handleOnChange(value)}
        value={languageValue as LanguageOption}
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
            disabled
            aria-readonly
            variant="filled"
            label={format(parseISO(journey?.publishedAt), 'P')}
            InputProps={{
              sx: {
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(0, 0, 0, 0.06)'
                }
              }
            }}
            InputLabelProps={{
              sx: {
                '&.Mui-disabled': {
                  color: 'secondary.main'
                }
              }
            }}
          />
        )}
      </Stack>
    </>
  )
}
