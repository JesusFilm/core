import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import { styled } from '@mui/material/styles'
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

interface RefinementGroupsProps {
  refinements: RefinementListRenderState
  languages: Record<string, string[]>
}

export function RefinementGroups({
  refinements,
  languages
}: RefinementGroupsProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { canToggleShowMore, isShowingMore, toggleShowMore } = refinements
  const shouldFade = canToggleShowMore && !isShowingMore

  return (
    <>
      {refinements.items.length > 0 ? (
        <>
          <Grid
            container
            spacing={3}
            columns={{ xs: 1, lg: 6 }}
            direction={{ xs: 'column', lg: 'row' }}
            sx={{
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
                  <Grid key={continent} size={1}>
                    <RefinementGroup
                      title={continent}
                      refinement={{
                        ...refinements,
                        items
                      }}
                    />
                  </Grid>
                ) : null
              }
            )}
          </Grid>
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
