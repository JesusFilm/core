import { ReactElement } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { gql, useQuery } from '@apollo/client'
import keyBy from 'lodash/keyBy'
import { GetLanguages } from '../../../__generated__/GetLanguages'

interface LanguageSelectProps {
  onChange: (value?: string) => void
  value?: string
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
  value,
  currentLanguageId
}: LanguageSelectProps): ReactElement {
  const { data, loading } = useQuery<GetLanguages>(GET_LANGUAGES, {
    variables: { languageId: currentLanguageId }
  })
  const languages = keyBy(data?.languages ?? [], 'id')

  return (
    <Autocomplete
      disableClearable
      value={value}
      getOptionLabel={(option) =>
        languages[option]?.name.find(({ primary }) => !primary)?.value ??
        languages[option]?.name.find(({ primary }) => primary)?.value ??
        ''
      }
      onChange={(_event, value) => handleChange(value)}
      options={data?.languages.map(({ id }) => id) ?? []}
      loading={loading}
      disablePortal={process.env.NODE_ENV === 'test'}
      renderInput={(params) => (
        <TextField
          {...params}
          hiddenLabel
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
        const currentLanguageName = languages[option]?.name.find(
          ({ primary }) => !primary
        )?.value
        const nativeLanguageName = languages[option]?.name.find(
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
                  {languages[option]?.name.find(({ primary }) => primary)
                    ?.value ?? ''}
                </Typography>
              )}
            </Stack>
          </li>
        )
      }}
    />
  )
}
