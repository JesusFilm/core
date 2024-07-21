import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { Index } from 'react-instantsearch'
import { StrategySection } from './StrategySection/StrategySection'

export function StrategySections(): ReactElement {
  // TODO: update this indexes variable to use the real indexes
  const indexes = [
    //  'wp_dev_posts_passionpurpose'
  ]

  return (
    <Stack data-testid="StrategySections" sx={{ pt: 4, gap: 16 }}>
      <Index indexName="wp_dev_posts_mission-trip">
        <StrategySection />
        {indexes?.map((indexName, index) => (
          <Index key={index} indexName={indexName}>
            <StrategySection />
          </Index>
        ))}
      </Index>
    </Stack>
  )
}
