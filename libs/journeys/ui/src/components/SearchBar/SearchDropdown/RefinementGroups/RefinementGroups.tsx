import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'

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

interface RefinementGroupsProps {
  refinements: RefinementListRenderState
  languages: Record<string, string[]>
}

export function RefinementGroups({
  refinements,
  languages
}: RefinementGroupsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()

  const [country, setCountry] = useState('')
  const { canToggleShowMore, isShowingMore, toggleShowMore } = refinements
  const shouldFade = canToggleShowMore && !isShowingMore

  const detectCountry = useCallback(() => {
    const locale = navigator.language
    try {
      const regionCode = new Intl.Locale(locale).maximize().region
      const regionNames = new Intl.DisplayNames([locale], { type: 'region' })
      const countryName = regionNames.of(regionCode ?? '')
      setCountry(countryName ?? '')
    } catch (error) {
      console.error('Error detecting country:', error)
    }
  }, [])

  useEffect(() => {
    detectCountry()
  }, [detectCountry])

  return (
    <>
      {refinements.items.length > 0 ? (
        <>
          <Stack spacing={2} sx={{ pb: 12 }}>
            <Typography variant="h6">{country}: </Typography>
          </Stack>
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
