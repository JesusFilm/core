import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import { Index } from 'react-instantsearch'

import { EmptySearch } from '@core/journeys/ui/EmptySearch'

import { StrategySection } from './StrategySection/StrategySection'

interface StrategySectionsProps {
  includeIndex?: boolean
}

export function StrategySections({
  includeIndex = false
}: StrategySectionsProps): ReactElement {
  // TODO: update this indexes variable to use the real indexes
  const indexes = ['wp_dev_posts_mission-trip', 'wp_dev_posts_passionpurpose']

  const [hasResult, setHasResult] = useState<boolean>(true)

  const resultsMap = new Map<number, boolean>()

  function handleItemSearch(index: number, hasResult: boolean): void {
    resultsMap.set(index, hasResult)
    const hasAnyResults = Array.from(resultsMap.values()).some((value) => value)
    setHasResult(hasAnyResults)
  }

  return (
    <Stack data-testid="StrategySections" sx={{ pt: 0, gap: 10 }}>
      {!hasResult && <EmptySearch />}
      {includeIndex ? (
        <Index indexName={indexes[0]}>
          <StrategySection index={0} handleItemSearch={handleItemSearch} />
          {indexes.slice(1).map((indexName, index) => (
            <Index key={index} indexName={indexName}>
              <StrategySection
                index={index + 1}
                handleItemSearch={handleItemSearch}
              />
            </Index>
          ))}
        </Index>
      ) : (
        <>
          {indexes.map((indexName, index) => (
            <StrategySection
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
