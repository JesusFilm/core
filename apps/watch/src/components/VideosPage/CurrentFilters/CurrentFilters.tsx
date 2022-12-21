import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
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
    <Stack direction="row" spacing={4} sx={{ alignItems: 'center', pb: 7 }}>
      {/* Button will be functional when more filtering is added */}
      <Button
        disabled
        startIcon={<FilterListRoundedIcon />}
        sx={{
          '&.Mui-disabled': { color: '#EF3340' }
        }}
      >
        Filters
      </Button>

      <Box sx={{ display: 'flex', overflow: 'scroll' }}>
        {/* TODO: scroll bar not showing up  */}
        {languageFilters.map((language) => (
          <Chip
            key={language.id}
            variant="outlined"
            // TODO: chip is inheriting a transparency from somewhere
            color="primary"
            label={language.nativeName}
            deleteIcon={<CloseRoundedIcon fontSize="small" />}
            onDelete={() => onDelete(language)}
            sx={{
              mr: 3,
              border: '1px solid #DCDAD2'
            }}
          />
        ))}
      </Box>
    </Stack>
  )
}
