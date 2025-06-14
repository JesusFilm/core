import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
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

import { useSearchBar } from '../../../../libs/algolia/SearchBarProvider'

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

interface RefinementGroupsProps {
  refinements: RefinementListRenderState
}

export function RefinementGroups({
  refinements
}: RefinementGroupsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const theme = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const { refine: clearRefinements, canRefine: canClearRefinements } =
    useClearRefinements()

  const {
    state: { continentLanguages }
  } = useSearchBar()

  function handleClick(): void {
    clearRefinements()
  }

  const languageEntries = Object.entries(continentLanguages)
  const isLoading = languageEntries.length === 0

  const hasRefinements = refinements.items.length > 0

  return (
    <>
      {!isLoading && hasRefinements ? (
        <>
          <Grid
            container
            spacing={1}
            columns={{ xs: 1, lg: 6 }}
            direction={{ xs: 'column', lg: 'row' }}
            sx={{
              minHeight: 344,
              height: isCollapsed ? 'auto' : 344,
              overflow: 'hidden',
              '-webkit-mask-image': !isCollapsed
                ? {
                    xs: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    lg: 'linear-gradient(to bottom, black 60%, transparent 60%)'
                  }
                : 'none',
              'mask-image': !isCollapsed
                ? {
                    xs: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    lg: 'linear-gradient(to bottom, black 60%, transparent 85%)'
                  }
                : 'none'
            }}
          >
            {languageEntries.map(([continent, continentLanguages]) => {
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
              ) : (
                <></>
              )
            })}
          </Grid>
          <Box sx={{ justifyContent: 'center', display: 'flex' }}>
            <Stack direction="row" spacing={3}>
              <StyledButton
                size="small"
                onClick={() => setIsCollapsed(!isCollapsed)}
                endIcon={isCollapsed ? <ChevronUp /> : <ChevronDown />}
              >
                {t(isCollapsed ? 'See Less' : 'See All')}
              </StyledButton>
              {canClearRefinements && (
                <StyledButton
                  size="small"
                  onClick={handleClick}
                  disabled={!canClearRefinements}
                  endIcon={<X1 />}
                  sx={{
                    border: `2px solid ${theme.palette.secondary.main}`,
                    color: theme.palette.secondary.main
                  }}
                >
                  {t('Clear All')}
                </StyledButton>
              )}
            </Stack>
          </Box>
        </>
      ) : (
        <>
          {!hasRefinements && (
            <Typography mb={5}>
              {t(
                `Sorry, there are no languages available for this search. Try removing some of your search criteria!`
              )}
            </Typography>
          )}
          {isLoading && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mb={5}
            >
              <Typography>{t(`Loading...`)}</Typography>
            </Box>
          )}
        </>
      )}
    </>
  )
}
