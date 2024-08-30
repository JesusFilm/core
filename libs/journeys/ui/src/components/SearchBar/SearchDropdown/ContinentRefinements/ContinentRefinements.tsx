import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { useLanguagesContinentsQuery } from '../../../../libs/useLanguagesContinentsQuery'
import { useSortLanguageContinents } from '../../../../libs/useSortLanguageContinents'

import { RefinementGroup } from './RefinementGroup'

export function ContinentRefinements(): ReactElement {
  const { t } = useTranslation('apps-watch')

  const { data } = useLanguagesContinentsQuery()
  const languages = useSortLanguageContinents({
    languages: data?.languages ?? []
  })
  const refinements = useRefinementList({
    attribute: 'languageEnglishName',
    limit: 1000
  })

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
