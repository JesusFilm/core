import { EmptySearch } from '@core/journeys/ui/EmptySearch'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import { Index } from 'react-instantsearch'
import { StrategySection } from './StrategySection/StrategySection'

interface StrategySectionsProps {
  index?: boolean
}

export function StrategySections({
  index
}: StrategySectionsProps): ReactElement {
  // TODO: update this indexes variable to use the real indexes
  const indexes = ['wp_dev_posts_passionpurpose']

  const [hasResult, setHasResult] = useState<boolean>(true)

  const resultsMap = new Map<number, boolean>()

  function handleItemSearch(index: number, hasResult: boolean) {
    resultsMap.set(index, hasResult)
    const hasTrueValue = Array.from(resultsMap.values()).some(
      (value) => value === true
    )
    setHasResult(hasTrueValue)
  }

  return (
    <Stack data-testid="StrategySections" sx={{ pt: 4, gap: 16 }}>
      {!hasResult && <EmptySearch />}
      {index ? (
        <Index indexName="wp_dev_posts_mission-trip">
          <StrategySection index={0} handleItemSearch={handleItemSearch} />
          {indexes.map((indexName, index) => (
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
          <StrategySection index={0} handleItemSearch={handleItemSearch} />
          {indexes.map((indexName, index) => (
            <StrategySection
              key={indexName}
              index={index}
              handleItemSearch={handleItemSearch}
            />
          ))}
        </>
      )}
    </Stack>
  )
}
