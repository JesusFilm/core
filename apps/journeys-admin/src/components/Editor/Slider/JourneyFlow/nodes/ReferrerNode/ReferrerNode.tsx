import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import type { NodeProps } from 'reactflow'

import type { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'

import { BaseNode, HandleVariant } from '../BaseNode'

import { BaseReferrer } from './BaseReferrer'
import { OtherReferrer } from './OtherReferrer'

interface ReferrerNodeProps extends NodeProps {
  data:
    | JourneyReferrer
    | { property: 'other sources'; referrers: JourneyReferrer[] }
}

export function ReferrerNode({ data }: ReferrerNodeProps): ReactElement {
  return (
    <BaseNode
      id="referrer"
      sourceHandle={HandleVariant.Disabled}
      isSourceConnected
    >
      <Box
        sx={{
          width: 180,
          backgroundColor: 'background.paper',
          borderRadius: 5,
          boxShadow: 3,
          overflow: 'hidden'
        }}
      >
        {'referrers' in data ? (
          <OtherReferrer {...data} />
        ) : (
          <BaseReferrer {...data} />
        )}
      </Box>
    </BaseNode>
  )
}
