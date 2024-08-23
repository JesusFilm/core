import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Popper from '@mui/material/Popper'
import { ReactElement } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { RefinementGroup } from './RefinementGroup'

interface AlgoliaLanguageDropdownProps {
  open: boolean
  handleClickAway: () => void
  id?: string
  anchorEl?: HTMLElement | null
}

export function AlgoliaLanguageDropdown({
  open,
  handleClickAway,
  id,
  anchorEl
}: AlgoliaLanguageDropdownProps): ReactElement {
  const refinements = useRefinementList({ attribute: 'languageEnglishName' })

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      sx={{ width: anchorEl?.clientWidth }}
      data-testid="SearchLangaugeFilter"
      modifiers={[
        {
          name: 'flip',
          enabled: false
        }
      ]}
    >
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          sx={{ p: 8, bgcolor: 'background.paper', mt: 3 }}
          borderRadius={3}
          boxShadow="0px 4px 4px 0px #00000040"
        >
          <Box color="text.primary">
            <RefinementGroup title="Languages" refinement={refinements} />
          </Box>
        </Box>
      </ClickAwayListener>
    </Popper>
  )
}
