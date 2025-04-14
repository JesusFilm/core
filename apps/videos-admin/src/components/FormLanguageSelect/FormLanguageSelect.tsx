import TextField from '@mui/material/TextField'
import { useField } from 'formik'
import { ReactElement, useMemo, useState } from 'react'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

export function FormLanguageSelect({
  name,
  label,
  initialLanguage,
  existingLanguageIds,
  parentObjectId
}: {
  name: string
  label: string
  initialLanguage?: LanguageOption
  existingLanguageIds?: string[]
  parentObjectId?: string
}): ReactElement {
  // TODO: provide correct languageId
  const { data, loading } = useLanguagesQuery({ languageId: '529' })
  const [formikProps, meta, helpers] = useField(name)
  const [selectedLanguage, setSelectedLanguage] = useState<
    LanguageOption | undefined
  >(initialLanguage)

  const handleChange = async (newLanguage: LanguageOption) => {
    setSelectedLanguage(newLanguage)
    await helpers.setValue(newLanguage.id)
  }

  const hasError = meta.error !== undefined && meta.touched

  const filteredLanguages = useMemo(() => {
    if (!data?.languages || !existingLanguageIds) {
      return data?.languages
    }

    return data.languages.filter((language) => {
      if (parentObjectId && existingLanguageIds.includes(language.id)) {
        return true
      }
      return !existingLanguageIds.includes(language.id)
    })
  }, [data?.languages, existingLanguageIds, parentObjectId])

  return (
    <LanguageAutocomplete
      value={selectedLanguage}
      onChange={handleChange}
      loading={loading}
      languages={filteredLanguages}
      renderInput={(params) => (
        <TextField
          {...params}
          onBlur={formikProps.onBlur}
          label={label}
          variant="outlined"
          helperText={hasError ? meta.error : ''}
          error={hasError}
        />
      )}
    />
  )
}
