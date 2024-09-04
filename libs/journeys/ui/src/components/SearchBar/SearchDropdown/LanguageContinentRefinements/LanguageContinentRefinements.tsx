import Typography from '@mui/material/Typography'
import { RefinementListRenderState } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { RefinementGroup } from './RefinementGroup'

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

  return (
    <>
      {refinements.items.length > 0 ? (
        <>
          {Object.entries(languages).map(([continent, continentLanguages]) => {
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
          })}
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
