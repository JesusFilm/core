import Box from '@mui/material/Box'
import type { NodeProps } from '@xyflow/react'
import { ReactElement } from 'react'

import type { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'

import { BaseNode, HandleVariant } from '../BaseNode'

import { BaseReferrer } from './BaseReferrer'
import { OtherReferrer } from './OtherReferrer'

type ReferrerData =
  | JourneyReferrer
  | { property: 'other sources'; referrers: JourneyReferrer[] }

interface ReferrerNodeProps extends Omit<NodeProps, 'data'> {
  data: ReferrerData
}

export function ReferrerNode({
  data,
  ...props
}: ReferrerNodeProps): ReactElement {
  return (
    <BaseNode
      sourceHandle={HandleVariant.Disabled}
      isSourceConnected
      {...props}
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
        {isOtherReferrer(data) ? (
          <OtherReferrer {...data} />
        ) : (
          <BaseReferrer {...data} />
        )}
      </Box>
    </BaseNode>
  )
}

function isOtherReferrer(
  data: ReferrerData
): data is { property: 'other sources'; referrers: JourneyReferrer[] } {
  return 'referrers' in data
}
