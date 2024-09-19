import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import { Index } from 'react-instantsearch'

import { EmptySearch } from '@core/journeys/ui/EmptySearch'

import { ResourceSection } from './ResourceSection'

const PROD_INDEXES = [
  'wp_prd_posts_equipment',
  'wp_prd_posts_training_strategies',
  'wp_prd_posts_outreach_resources',
  'wp_prd_posts_prayer_resources',
  'wp_prd_posts_digital_strategies'
]

const DEV_INDEXES = [
  'wp_dev_posts_equipment',
  'wp_dev_posts_training_strategies',
  'wp_dev_posts_outreach_resources',
  'wp_dev_posts_prayer_resources',
  'wp_dev_posts_digital_strategies'
]

function getIndexes(): string[] {
  const isProd = process.env.DOPPLER_ENVIRONMENT === 'prd'
  return isProd ? PROD_INDEXES : DEV_INDEXES
}

interface ResourceSectionsProps {
  includeIndex?: boolean
}

export function ResourceSections({
  includeIndex = false
}: ResourceSectionsProps): ReactElement {
  const indexes = getIndexes()
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
