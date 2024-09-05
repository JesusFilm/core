import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

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
  handleLanguagesSelect: (
    continent: string,
    language: string,
    isRefined: boolean
  ) => void
  selectedLanguagesByContinent?: Record<string, string[]>
}

export function LanguageContinentRefinements({
  refinements,
  languages,
  handleLanguagesSelect,
  selectedLanguagesByContinent
}: LanguageContinentRefinementsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()

  const { canToggleShowMore, isShowingMore, toggleShowMore } = refinements
  const shouldFade = canToggleShowMore && !isShowingMore

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
              },
              '-webkit-mask-image': shouldFade
                ? {
                    xs: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    lg: 'linear-gradient(to bottom, black 60%, transparent 60%)'
                  }
                : 'none',
              'mask-image': shouldFade
                ? {
                    xs: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    lg: 'linear-gradient(to bottom, black 60%, transparent 85%)'
                  }
                : 'none'
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
                    selectedLanguagesByContinent={selectedLanguagesByContinent}
                    handleLanguagesSelect={handleLanguagesSelect}
                  />
                ) : (
                  <></>
                )
              }
            )}
          </Stack>
          {canToggleShowMore && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <StyledButton
                size="small"
                onClick={toggleShowMore}
                disabled={!canToggleShowMore}
                endIcon={isShowingMore ? <ChevronUp /> : <ChevronDown />}
              >
                {t(isShowingMore ? 'See Less' : 'See All')}
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
