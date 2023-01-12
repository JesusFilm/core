import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Chip from '@mui/material/Chip'
import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

export interface ChangeFilterProps {
  field: string
  setFilter: (value: string[]) => void
  selectedOptions?: LanguageOption[]
}

interface AppliedFilterProps {
  value: string[]
  onDelete: (props: ChangeFilterProps) => void
}

interface CurrentFilterProps {
  audioLanguages: AppliedFilterProps
  subtitleLanguages: AppliedFilterProps
}

export function CurrentFilters({
  audioLanguages,
  subtitleLanguages
}: CurrentFilterProps): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{ alignItems: 'center', pb: 7, overflow: 'hidden' }}
    >
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

      <Box sx={{ display: 'flex', overflowX: 'auto' }}>
        {/* TODO: scroll bar not showing up  */}
        {audioLanguages.value.map((language) => (
          <Chip
            key={`audio: ${language}`}
            variant="outlined"
            color="primary"
            label={`audio: ${language}`}
            deleteIcon={
              <CloseRoundedIcon
                data-testid={`delete audio ${language} filter`}
                fontSize="small"
              />
            }
            onDelete={audioLanguages.onDelete}
            sx={{
              mr: 3,
              border: '1px solid #DCDAD2'
            }}
          />
        ))}
        {subtitleLanguages.value.map((language) => (
          <Chip
            key={`sub: ${language}`}
            variant="outlined"
            color="primary"
            label={`sub: ${language}`}
            deleteIcon={
              <CloseRoundedIcon
                data-testid={`delete subtitle ${language} filter`}
                fontSize="small"
              />
            }
            onDelete={subtitleLanguages.onDelete}
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
