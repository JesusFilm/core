import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { ReactElement } from 'react'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { LanguageContinentRefinements } from './LanguageContinentRefinements'
import { Suggestions } from './Suggestions'

interface SearchbarDropdownProps {
  open: boolean
  refinements: RefinementListRenderState
  id?: string
  anchorEl?: HTMLElement | null
  variant?: string
}

export function SearchbarDropdown({
  open,
  refinements,
  id,
  anchorEl,
  variant = 'languages'
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
          {variant === 'languages' && (
            <LanguageContinentRefinements
              refinements={refinements}
              languages={languages}
            />
          )}
          {variant === 'suggestions' && (
            <Suggestions refinements={refinements} />
          )}
        </Stack>
      </Box>
    </Popper>
  )
}
