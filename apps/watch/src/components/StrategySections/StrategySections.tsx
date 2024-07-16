import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { StrategySection } from './StrategySection/StrategySection'

import { Index } from 'react-instantsearch'

export function StrategySections(): ReactElement {
  const indexes = ['wp_dev_posts_mission-trip', 'wp_dev_posts_development']

  return (
    <>
      <Box data-testid="StrategySections">
        {indexes.map((indexName, index) => (
          <Index key={index} indexName={indexName}>
            <StrategySection />
          </Index>
        ))}
      </Box>
    </>
  )
}
