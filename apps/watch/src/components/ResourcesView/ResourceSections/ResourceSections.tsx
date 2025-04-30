import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import { Index } from 'react-instantsearch'

import { EmptySearch } from '@core/journeys/ui/EmptySearch'

import { ResourceSection } from './ResourceSection'

interface ResourceSectionsProps {
  includeIndex?: boolean
}

export const indexes = [
  `${process.env.NEXT_PUBLIC_ALGOLIA_WP_PREFIX}_posts_equipment`,
  `${process.env.NEXT_PUBLIC_ALGOLIA_WP_PREFIX}_posts_training_strategies`,
  `${process.env.NEXT_PUBLIC_ALGOLIA_WP_PREFIX}_posts_outreach_resources`,
  `${process.env.NEXT_PUBLIC_ALGOLIA_WP_PREFIX}_posts_prayer_resources`,
  `${process.env.NEXT_PUBLIC_ALGOLIA_WP_PREFIX}_posts_digital_strategies`
]

export function ResourceSections({
  includeIndex = false
}: ResourceSectionsProps): ReactElement {
  const [hasResult, setHasResult] = useState<boolean>(true)

  const resultsMap = new Map<number, boolean>()

  function handleItemSearch(index: number, hasResult: boolean): void {
    resultsMap.set(index, hasResult)
    const hasAnyResults = Array.from(resultsMap.values()).some((value) => value)
    setHasResult(hasAnyResults)
  }

  return (
    <Stack data-testid="ResourceSections" sx={{ pt: 0, gap: 10 }}>
      {!hasResult && <EmptySearch />}
      {includeIndex ? (
        <Index indexName={indexes[0]}>
          <ResourceSection index={0} handleItemSearch={handleItemSearch} />
          {indexes.slice(1).map((indexName, index) => (
            <Index key={index} indexName={indexName}>
              <ResourceSection
                index={index + 1}
                handleItemSearch={handleItemSearch}
              />
            </Index>
          ))}
        </Index>
      ) : (
        <>
          {indexes.map((indexName, index) => (
            <ResourceSection
              key={indexName}
              index={index + 1}
              handleItemSearch={handleItemSearch}
            />
          ))}
        </>
      )}
    </Stack>
  )
}
