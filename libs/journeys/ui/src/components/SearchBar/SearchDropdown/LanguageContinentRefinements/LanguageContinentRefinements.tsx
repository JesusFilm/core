import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import ChevronUp from '@core/shared/ui/icons/ChevronUp'

import { RefinementGroup } from './RefinementGroup'

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 32,
  gap: 0,
  padding: '8px 20px 8px 20px',
  border: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper
}))

interface LanguageContinentRefinementsProps {
  refinements: RefinementListRenderState
  languages: Record<string, string[]>
}

export function LanguageContinentRefinements({
  refinements,
  languages
}: LanguageContinentRefinementsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()

  const [selectedContinent, setSelectedContinent] = useState<string>()

  return (
    <>
      {refinements.items.length > 0 ? (
        <>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            sx={{
              [theme.breakpoints.down('lg')]: {
                gap: 6
              }
            }}
          >
            {Object.entries(languages).map(
              ([continent, continentLanguages]) => {
                const items = refinements.items.filter((item) =>
                  continentLanguages.some((language) => language === item.label)
                )
                return items.length > 0 ? (
                  <RefinementGroup
                    key={continent}
                    title={continent}
                    refinement={{
                      ...refinements,
                      items
                    }}
                    selectedContinent={selectedContinent}
                    handleSelectedContinent={(continent) =>
                      setSelectedContinent(continent)
                    }
                  />
                ) : (
                  <></>
                )
              }
            )}
          </Stack>
          {refinements.canToggleShowMore && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <StyledButton
                size="small"
                onClick={refinements.toggleShowMore}
                disabled={!refinements.canToggleShowMore}
                endIcon={
                  refinements.isShowingMore ? <ChevronUp /> : <ChevronDown />
                }
              >
                {t(refinements.isShowingMore ? 'See Less' : 'See All')}
              </StyledButton>
            </Box>
          )}
        </>
      ) : (
        <Typography>
          {t(
            `Sorry, there are no languages available for this search. Try removing some of your search criteria!`
          )}
        </Typography>
      )}
    </>
  )
}
