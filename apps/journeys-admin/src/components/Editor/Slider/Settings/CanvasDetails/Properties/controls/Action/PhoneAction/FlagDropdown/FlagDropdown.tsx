import IconButton from '@mui/material/IconButton'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useMemo, useState } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'

import { CountryFlag } from './CountryFlag'
import { Country } from './countriesList'

interface FlagDropdownProps {
  countries: Country[]
  selectedCountry: Country
  onChange: (country: Country) => void
}

export function FlagDropdown({
  countries,
  selectedCountry,
  onChange
}: FlagDropdownProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [searchValue, setSearchValue] = useState('')
  const isOpen = Boolean(anchorEl)

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.label.localeCompare(b.label)),
    [countries]
  )

  const filteredCountries = useMemo(() => {
    if (!searchValue.trim()) return sortedCountries
    return sortedCountries.filter((country) =>
      country.label.toLowerCase().startsWith(searchValue.toLowerCase())
    )
  }, [sortedCountries, searchValue])

  function handleClick(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
    setSearchValue('')
  }

  function handleSelect(country: Country): void {
    onChange(country)
    handleClose()
  }

  return (
    <>
      <IconButton
        aria-label={t('Select country')}
        size="small"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick(e as unknown as MouseEvent<HTMLElement>)
          }
        }}
        edge="start"
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CountryFlag
            code={selectedCountry.countryCode}
            countryName={selectedCountry.label}
          />
          <KeyboardArrowDownIcon fontSize="small" />
        </Box>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{
          mt: 2,
          p: 0,
          transform: 'translateX(-10px)'
        }}
        slotProps={{
          paper: {
            style: {
              maxHeight: 670,
              width: 298,
              padding: 0,
            },
            sx: {
              '& .MuiList-root': {
                padding: 0
              }
            }
          },
        }}
      >
        <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
          <TextField
            size="small"
            placeholder={t('Search countries...')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            fullWidth
            variant="outlined"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0
              }
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </Box>
        {filteredCountries.map((country) => (
          <MenuItem
            onClick={() => handleSelect(country)}
            key={country.countryCode}
            selected={country.countryCode === selectedCountry.countryCode}
          >
            <ListItemIcon>
              <CountryFlag code={country.countryCode} countryName={country.label} />
            </ListItemIcon>
            <ListItemText
              primary={`${country.label} (${country.countryCode}) ${country.callingCode}`}
              sx={{
                '& .MuiListItemText-primary': {
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}


