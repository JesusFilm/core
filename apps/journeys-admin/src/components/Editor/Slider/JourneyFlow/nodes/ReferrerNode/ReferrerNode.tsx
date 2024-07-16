import Box from '@mui/material/Box'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import type { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'
import type { NodeProps } from 'reactflow'
import { BaseNode } from '../BaseNode'
import { BaseReferrer } from './BaseReferrer'
import { OtherReferrer } from './OtherReferrer'

interface ReferrerNodeProps extends NodeProps {
  data:
    | JourneyReferrer
    | { property: 'other sources'; referrers: JourneyReferrer[] }
}

export function ReferrerNode({ data }: ReferrerNodeProps) {
  const {
    state: { showAnalytics }
  } = useEditor()

  return (
    <BaseNode id="referrer" sourceHandle="disabled" isSourceConnected>
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
