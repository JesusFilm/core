import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { StrategySection } from './StrategySection/StrategySection'

import Container from '@mui/material/Container'
import { Index } from 'react-instantsearch'

export function StrategySections(): ReactElement {
  const indexes = ['wp_dev_posts_mission-trip', 'wp_dev_posts_passionpurpose']

  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <Container maxWidth="xxl">
        <Box data-testid="StrategySections">
          <Index indexName="wp_dev_posts_mission-trip">
            {indexes.map((indexName, index) => (
              <Index key={index} indexName={indexName}>
                <StrategySection />
              </Index>
            ))}
          </Index>
        </Box>
      </Container>
    </Box>
  )
}
