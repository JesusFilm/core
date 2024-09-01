import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { ReactElement } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { LanguageContinentRefinements } from './LanguageContinentRefinements'
import { Suggestions } from './Suggestions'

interface SearchbarDropdownProps {
  open: boolean
  id?: string
  anchorEl?: HTMLElement | null
  varient?: string
}

export function SearchbarDropdown({
  open,
  id,
  anchorEl,
  varient = 'languages'
}: SearchbarDropdownProps): ReactElement {
  const theme = useTheme()

  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })
  const refinements = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 1000
  })

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ width: anchorEl?.clientWidth }}
      data-testid="SearchBarDropdown"
      modifiers={[
        {
          name: 'flip',
          enabled: false
        }
      ]}
    >
      <Box
        borderRadius={3}
        boxShadow="0px 4px 4px 0px #00000040"
        sx={{ p: 8, bgcolor: 'background.paper', mt: 3 }}
      >
        <Stack
          color="text.primary"
          direction={{ xs: 'column', lg: 'row' }}
          justifyContent="space-around"
          sx={{
            [theme.breakpoints.down('lg')]: {
              gap: 6
            }
          }}
        >
          {varient === 'languages' && (
            <LanguageContinentRefinements
              refinements={refinements}
              languages={languages}
            />
          )}
          {varient === 'suggestions' && <Suggestions />}
        </Stack>
      </Box>
    </Popper>
  )
}
