import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { countries, CountryType } from './countriesList'

// Helper function to render country flag
function CountryFlag({
  code,
  size = 20
}: {
  code: string | null
  size?: number
}): ReactElement | null {
  return code ? (
    <Box
      component="span"
      sx={{
        display: 'flex',
        alignItems: 'center',
        mr: 1,
        width: 20
      }}
    >
      <img
        loading="lazy"
        width={size}
        height={size * 0.75}
        src={`https://flagcdn.com/w${size}/${code.toLowerCase()}.png`}
        srcSet={`https://flagcdn.com/w${size * 2}/${code.toLowerCase()}.png 2x`}
        alt=""
        style={{ marginRight: 8 }}
      />
    </Box>
  ) : null
}

// Custom Popper component to match parent container width
function CustomPopper(props: any): ReactElement {
  // Try to find the parent container - first check for data-testid, then fallback to parent element
  const parentElement =
    props.anchorEl?.closest('[data-testid="PhoneAction"]') ||
    props.anchorEl?.parentElement
  const parentWidth = parentElement?.offsetWidth || 'auto'

  return (
    <Popper
      {...props}
      style={{ width: parentWidth, maxWidth: '100%' }}
      placement="bottom-start"
      popperOptions={{
        modifiers: [
          {
            name: 'flip',
            enabled: false
          },
          {
            name: 'preventOverflow',
            enabled: true,
            options: {
              altAxis: true,
              rootBoundary: 'document'
            }
          }
        ]
      }}
    />
  )
}

interface CountryCodeAutoCompleteProps {
  onChange?: (countryCode: string) => void
}

export function CountryCodeAutoComplete({
  onChange
}: CountryCodeAutoCompleteProps = {}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const defaultCountry = countries.find((country) => country.code === 'US')
  const [selectedCountry, setSelectedCountry] = useState<
    CountryType | undefined
  >(defaultCountry)

  return (
    <Autocomplete
      options={countries}
      value={selectedCountry}
      onChange={(event, newValue) => {
        setSelectedCountry(newValue)
        if (newValue && onChange) {
          onChange(newValue.phone)
        }
      }}
      disableClearable
      autoHighlight
      getOptionLabel={(option) => `${option.phone}`}
      filterOptions={(options, state) =>
        options.filter(
          (option) =>
            option.label
              .toLowerCase()
              .startsWith(state.inputValue.toLowerCase()) ||
            option.phone.startsWith(state.inputValue)
        )
      }
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        return (
          <Box
            key={key + option.code}
            component="li"
            sx={{ display: 'flex', alignItems: 'center' }}
            {...optionProps}
          >
            <CountryFlag code={option.code} />
            {option.label} ({option.code}) +{option.phone}
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="filled"
          hiddenLabel
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: selectedCountry ? (
                <CountryFlag code={selectedCountry.code} />
              ) : undefined
            }
          }}
        />
      )}
      slots={{
        popper: CustomPopper
      }}
      disablePortal={false}
      sx={{ width: 160 }}
    />
  )
}
