import Box from '@mui/material/Box'
import Popper from '@mui/material/Popper'
import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { Dispatch, ReactElement, SetStateAction } from 'react'

import Globe1 from '@core/shared/ui/icons/Globe1'
import Search1 from '@core/shared/ui/icons/Search1'
import { TabPanel } from '@core/shared/ui/TabPanel'

import { useLanguagesContinentsQuery } from '../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../libs/useSortLanguageContinents'

import { LanguageContinentRefinements } from './LanguageContinentRefinements'
import { Suggestions } from './Suggestions'

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: '50px',
  fontSize: '14px !important',

  '& .MuiTab-iconWrapper': {
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing(5)
    }
  },

  // Hide the text label on small screens
  [theme.breakpoints.down('md')]: {
    '& .tab-label': {
      display: 'none'
    }
  }
}))

interface SearchbarDropdownProps {
  open: boolean
  refinements: RefinementListRenderState
  id?: string
  anchorEl?: HTMLElement | null
  tabIndex?: number
  handleTabValueChange: Dispatch<SetStateAction<number>>
}

export function SearchbarDropdown({
  open,
  refinements,
  id,
  anchorEl,
  tabIndex: tabValue = 0,
  handleTabValueChange: setTabValue
}: SearchbarDropdownProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })

  function handleTabChange(
    event: React.SyntheticEvent,
    newValue: number
  ): void {
    setTabValue(newValue)
  }

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
        sx={{ px: 8, pb: 8, bgcolor: 'background.paper', mt: 3 }}
        color="text.primary"
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Searchbar dropdown"
            textColor="secondary"
          >
            <StyledTab
              icon={<Search1 />}
              iconPosition="start"
              label={
                <span className="tab-label">{t('Search Suggestions')}</span>
              }
            />
            <StyledTab
              icon={<Globe1 />}
              iconPosition="start"
              label={<span className="tab-label">{t('Languages')}</span>}
            />
          </Tabs>
        </Box>
        <TabPanel name="suggestions-tab" value={tabValue} index={0}>
          <Suggestions refinements={refinements} />
        </TabPanel>
        <TabPanel name="languages-tab" value={tabValue} index={1} pt={3}>
          <LanguageContinentRefinements
            refinements={refinements}
            languages={languages}
          />
        </TabPanel>
      </Box>
    </Popper>
  )
}
