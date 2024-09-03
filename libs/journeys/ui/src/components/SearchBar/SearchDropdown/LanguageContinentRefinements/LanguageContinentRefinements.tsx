import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { RefinementGroup } from './RefinementGroup'

interface LanguageContinentRefinementsProps {
  refinements: RefinementListRenderState
  languages: Record<string, string[]>
}

export function LanguageContinentRefinements({
  refinements,
  languages
}: LanguageContinentRefinementsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const [selectedContinent, setSelectedContinent] = useState<string>()

  return (
    <>
      {refinements.items.length > 0 ? (
        <Box display="flex" flexDirection="column" alignItems="center">
          <Stack direction={{ xs: 'column', md: 'row' }}>
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
            <Button
              onClick={refinements.toggleShowMore}
              disabled={!refinements.canToggleShowMore}
            >
              {t(refinements.isShowingMore ? 'See All' : 'See Less')}
            </Button>
          )}
        </Box>
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
