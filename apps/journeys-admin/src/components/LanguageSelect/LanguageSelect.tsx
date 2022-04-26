import { ReactElement } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { gql, useQuery } from '@apollo/client'
import { GetLanguages } from '../../../__generated__/GetLanguages'

interface LanguageSelectProps {
  onChange: (selectedLanguageId?: string) => void
  selectedLanguageId?: string
  currentLanguageId: string
}

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID) {
    languages {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

export function LanguageSelect({
  onChange: handleChange,
  selectedLanguageId,
  currentLanguageId
}: LanguageSelectProps): ReactElement {
  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: currentLanguageId }
  })
  const selectedLanguage =
    data?.languages.find(({ id }) => id === selectedLanguageId) ?? null

  return (
    <Autocomplete
      value={selectedLanguage}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      getOptionLabel={(option) =>
        option.name.find(({ primary }) => !primary)?.value ??
        option.name.find(({ primary }) => primary)?.value ??
        ''
      }
      onChange={(_event, value) => handleChange(value?.id)}
      options={data?.languages ?? []}
      loading={loading}
      disablePortal={process.env.NODE_ENV === 'test'}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Language"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => {
        const currentLanguageName = option.name.find(
          ({ primary }) => !primary
        )?.value
        const nativeLanguageName = option.name.find(
          ({ primary }) => primary
        )?.value
        return (
          <li {...props}>
            <Stack>
              <Typography>
                {currentLanguageName ?? nativeLanguageName}
              </Typography>
              {nativeLanguageName != null && currentLanguageName != null && (
                <Typography variant="body2" color="text.secondary">
                  {option.name.find(({ primary }) => primary)?.value ?? ''}
                </Typography>
              )}
            </Stack>
          </li>
        )
      }}
    />
  )
}
