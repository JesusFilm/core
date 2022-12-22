import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import Chip from '@mui/material/Chip'
import { GetLanguages_languages } from '../../../../__generated__/GetLanguages'
import { VideosFilter } from '../../../../__generated__/globalTypes'

interface Props {
  languages?: GetLanguages_languages[]
  filter: VideosFilter
  onDelete: (filterType: string, id: string) => void
}

export function CurrentFilters({
  languages,
  filter,
  onDelete
}: Props): ReactElement {
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
        {languages
          ?.filter((language) =>
            filter.availableVariantLanguageIds?.includes(language.id)
          )
          .map((language) => (
            <Chip
              key={language.id}
              variant="outlined"
              // TODO: chip is inheriting a transparency from somewhere
              color="primary"
              label={`audio: ${
                language.name[1]?.value ?? language.name[0]?.value
              }`}
              deleteIcon={<CloseRoundedIcon fontSize="small" />}
              onDelete={() => onDelete('al', language.id)}
              sx={{
                mr: 3,
                border: '1px solid #DCDAD2'
              }}
            />
          ))}
        {languages
          ?.filter((language) =>
            filter.subtitleLanguageIds?.includes(language.id)
          )
          .map((language) => (
            <Chip
              key={language.id}
              variant="outlined"
              // TODO: chip is inheriting a transparency from somewhere
              color="primary"
              label={`sub: ${
                language.name[1]?.value ?? language.name[0]?.value
              }`}
              deleteIcon={<CloseRoundedIcon fontSize="small" />}
              onDelete={() => onDelete('sl', language.id)}
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
