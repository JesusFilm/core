import { NoResultsFound } from '@core/journeys/ui/NoResultsFound'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'
import { Index } from 'react-instantsearch'
import { StrategySection } from './StrategySection/StrategySection'

export function StrategySections(): ReactElement {
  // TODO: update this indexes variable to use the real indexes
  // const indexes = ['wp_dev_posts_passionpurpose']

  // create state that stores if theres results
  // pass state into each section
  // const [result, setResult] = useState(false)
  // create a callback that tells you if theres a result or not
  // if there's no results render no result component

  const [missionVisable, setMissionVisable] = useState(true)
  const [passionVisable, setPassionVisable] = useState(true)

  function handleMission(hasResult) {
    setMissionVisable(hasResult)
  }

  function handlePassion(hasResult) {
    setPassionVisable(hasResult)
  }

  function hasResults() {
    return missionVisable || passionVisable
  }

  return (
    <Stack data-testid="StrategySections" sx={{ pt: 4, gap: 16 }}>
      {!hasResults() && <NoResultsFound />}
      <Index indexName="wp_dev_posts_mission-trip">
        <Index indexName="wp_dev_posts_mission-trip">
          <StrategySection handleResult={handleMission} />
        </Index>
        <Index indexName="wp_dev_posts_passionpurpose">
          <StrategySection handleResult={handlePassion} />
        </Index>
      </Index>
    </Stack>
  )
}
