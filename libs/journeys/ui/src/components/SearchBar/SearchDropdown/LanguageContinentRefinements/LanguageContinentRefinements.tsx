import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { useClearRefinements } from 'react-instantsearch'

import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import ChevronUp from '@core/shared/ui/icons/ChevronUp'
import X1 from '@core/shared/ui/icons/X1'

import { RefinementGroup } from './RefinementGroup'

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 32,
  gap: 0,
  [theme.breakpoints.up('md')]: {
    padding: `${theme.spacing(2)} ${theme.spacing(5)}`
  },
  [theme.breakpoints.down('md')]: {
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`
  },
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
  const { refine: clearRefinements, canRefine: canClearRefinements } =
    useClearRefinements()

  const [selectedContinent, setSelectedContinent] = useState<string>()
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
          <Box sx={{ justifyContent: 'center', display: 'flex' }}>
            <Stack direction="row" spacing={3}>
              {canToggleShowMore && (
                <StyledButton
                  size="small"
                  onClick={toggleShowMore}
                  disabled={!canToggleShowMore}
                  endIcon={isShowingMore ? <ChevronUp /> : <ChevronDown />}
                >
                  {t(isShowingMore ? 'See Less' : 'See All')}
                </StyledButton>
              )}
              {canClearRefinements && (
                <StyledButton
                  size="small"
                  onClick={clearRefinements}
                  disabled={!canClearRefinements}
                  endIcon={<X1 />}
                >
                  {t('Clear All')}
                </StyledButton>
              )}
            </Stack>
          </Box>
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
