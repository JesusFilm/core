import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { StrategySection } from './StrategySection/StrategySection'

export function StrategySections(): ReactElement {
  // with each strategySection:
  // wrap in index and hits, eg:
  //   <Index indexName="wp_dev_posts_mission-trip">
  //     <Configure hitsPerPage={10} />
  //     <Hits hitComponent={StrategySection items={hits}} />
  //   </Index>

  //

  return (
    <>
      <Box data-testid="StrategySections">
        <StrategySection />
      </Box>
    </>
  )
}
