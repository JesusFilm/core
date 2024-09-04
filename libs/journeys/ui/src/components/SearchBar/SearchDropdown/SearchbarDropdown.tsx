import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { ReactElement } from 'react'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { LanguageContinentRefinements } from './LanguageContinentRefinements'

interface SearchbarDropdownProps {
  open: boolean
  refinements: RefinementListRenderState
  id?: string
  anchorEl?: HTMLElement | null
}

export function SearchbarDropdown({
  open,
  refinements,
  id,
  anchorEl
}: SearchbarDropdownProps): ReactElement {
  const theme = useTheme()

  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ width: anchorEl?.clientWidth }}
      data-testid="SearchLanguageFilter"
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
          <LanguageContinentRefinements
            refinements={refinements}
            languages={languages}
          />
        </Stack>
      </Box>
    </Popper>
  )
}
