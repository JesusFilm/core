import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { CountryFlag } from './CountryFlag'
import { Country } from './countriesList'

interface CountryCodeAutoCompleteProps {
  countries: Country[]
  selectedCountry?: Country
  handleChange: (country: Country) => void
}

export function CountryCodeAutoComplete({
  countries,
  selectedCountry,
  handleChange
}: CountryCodeAutoCompleteProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Autocomplete
      options={countries}
      value={selectedCountry}
      onChange={(_, newValue) => {
        if (newValue) {
          handleChange(newValue)
        }
      }}
      disableClearable
      fullWidth
      autoHighlight
      getOptionLabel={(option) => option.label}
      filterOptions={(options, state) =>
        options.filter((option) =>
          option.label.toLowerCase().startsWith(state.inputValue.toLowerCase())
        )
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        return (
          <Box
            key={key + option.countryCode}
            component="li"
            sx={{ display: 'flex', alignItems: 'center' }}
            {...optionProps}
          >
            <CountryFlag code={option.countryCode} countryName={option.label} />
            {option.label} ({option.countryCode}) {option.callingCode}
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          label={t('Country')}
          placeholder={t('Select country')}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: selectedCountry ? (
                <Box sx={{ pl: 1 }}>
                  <CountryFlag
                    code={selectedCountry.countryCode}
                    countryName={selectedCountry.label}
                  />
                </Box>
              ) : undefined
            }
          }}
        />
      )}
      disablePortal={false}
    />
  )
}
