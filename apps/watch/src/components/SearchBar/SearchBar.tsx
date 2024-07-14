import { ParentTagIcon } from '@core/journeys/ui/ParentTagIcon'
import Search1Icon from '@core/shared/ui/icons/Search1'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import MuiPopper, { PopperProps } from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'
import {
  RefinementList,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'
import { TagsRefinementList } from './TagsRefinementList'

/* Styles below used to fake a gradient border because the 
css attributes border-radius and border-image-source are not compatible */
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: theme.palette.background.default,
    borderRadius: 8,
    '&.Mui-focused fieldset, fieldset': {
      borderRadius: 4
    },
    fieldset: {
      border: 'none'
    },
    input: {
      // Overriding the default set in components.tsx
      transform: 'none'
    }
  }
}))

export function SearchBar(props): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { query, refine, clear } = useSearchBox(props)
  const { status } = useInstantSearch()
  const [inputValue, setInputValue] = useState(query)

  const isSearchStalled = status === 'stalled'

  function setQuery(newQuery: string) {
    setInputValue(newQuery)

    refine(newQuery)
  }

  // Popper
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popper' : undefined

  return (
    <>
      <Box
        sx={{
          borderRadius: 3,
          background:
            'linear-gradient(90deg, #0C79B3 0%, #0FDABC 51%, #E72DBB 100%)',
          p: 1
        }}
        data-testid="SearchBar"
      >
        <StyledTextField
          {...props}
          placeholder={t('Search by topic, occasion, or audience ...')}
          fullWidth
          type="search"
          value={inputValue}
          onChange={(event) => {
            setQuery(event.currentTarget.value)
          }}
          onClick={handleClick}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search1Icon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Testing popper on searchbar */}
      <MuiPopper id="CategoriesTags" open={open} anchorEl={anchorEl}>
        <Stack direction="row">
          <Box
            sx={{
              border: 1,
              p: 1,
              bgcolor: 'background.default'
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              component="li"
              sx={{ px: 4, py: 2 }}
            >
              <ParentTagIcon name="Topics" sx={{ width: 38 }} />
              <Typography variant="subtitle1">Topics</Typography>
            </Stack>
            <TagsRefinementList attribute="tags.Topics" boolean />
          </Box>

          <Box
            sx={{
              border: 1,
              p: 1,
              bgcolor: 'background.default'
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              component="li"
              sx={{ px: 4, py: 2 }}
            >
              <ParentTagIcon name="Holidays" sx={{ width: 38 }} />
              <Typography variant="subtitle1">Holidays</Typography>
            </Stack>
            <TagsRefinementList attribute="tags.Holidays" />
          </Box>

          <Box
            sx={{
              border: 1,
              p: 1,
              bgcolor: 'background.default'
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              component="li"
              sx={{ px: 4, py: 2 }}
            >
              <ParentTagIcon name="Audience" sx={{ width: 38 }} />
              <Typography variant="subtitle1">Audience</Typography>
            </Stack>
            <TagsRefinementList attribute="tags.Audience" />
          </Box>

          <Box
            sx={{
              border: 1,
              p: 1,
              bgcolor: 'background.default'
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              component="li"
              sx={{ px: 4, py: 2 }}
            >
              <ParentTagIcon name="Collections" sx={{ width: 38 }} />
              <Typography variant="subtitle1">Collections</Typography>
            </Stack>
            <TagsRefinementList attribute="tags.Collections" />
          </Box>
        </Stack>
      </MuiPopper>

      {/* TODO: Another popper for languages */}
    </>
  )
}
