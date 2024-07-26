import { EmptySearch } from '@core/journeys/ui/EmptySearch'
import { Box } from '@mui/material'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import { Index, useInstantSearch } from 'react-instantsearch'
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

  const { status } = useInstantSearch()

  console.log(status)

  const loading = status === 'loading'

  // const { loading } = useSearch

  // find loading state from aloglia x
  // if loading, render one strategysection, passing in the loadign prop
  // using the loading prop, render a skeleton in the strategy section
  // pass loading prop from strategysection down to stratgeycard
  // on strategycard, render skeleton

  return (
    <Stack data-testid="StrategySections" sx={{ pt: 4, gap: 16 }}>
      {loading === true ? (
        <Box data-testid="loading box">
          <StrategySection
            index={0}
            handleItemSearch={handleItemSearch}
            loading
          />
        </Box>
      ) : (
        <>
          {!hasResult && <EmptySearch />}
          {/* {loading == true && <StrategySections loading/>} */}
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
        </>
      )}
    </Stack>
  )
}
