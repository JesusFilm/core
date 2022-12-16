import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import Chip from '@mui/material/Chip'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

interface Props {
  languageFilters: LanguageOption[]
  onDelete: (selectedLanguage: LanguageOption) => void
}

export function CurrentFilters({
  languageFilters,
  onDelete
}: Props): ReactElement {
  return (
    <Stack direction="row" sx={{ alignItems: 'center' }}>
      <Button startIcon={<FilterListRoundedIcon />}>Filters</Button>
      {languageFilters.map((language) => (
        <Chip
          key={language.id}
          label={language.nativeName}
          onDelete={() => onDelete(language)}
        />
      ))}
    </Stack>
  )
}
