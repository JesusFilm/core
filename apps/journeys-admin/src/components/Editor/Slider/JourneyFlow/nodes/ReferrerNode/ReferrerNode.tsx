import Box from '@mui/material/Box'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'
import { NodeProps } from 'reactflow'
import { BaseNode } from '../BaseNode'
import { BaseReferrer } from './BaseReferrer'
import { OtherReferrer } from './OtherReferrer'

interface ReferrerNodeProps extends NodeProps {
  data:
    | JourneyReferrer
    | { property: 'Other sources'; referrers: JourneyReferrer[] }
}

export function ReferrerNode({ data }: ReferrerNodeProps) {
  const {
    state: { showAnalytics }
  } = useEditor()

  return (
    <BaseNode
      id="referrer"
      sourceHandle={showAnalytics ? 'show' : 'hide'}
      isSourceConnected
    >
      <>
        {'referrers' in data ? (
          <OtherReferrer {...data} />
        ) : (
          <Box
            sx={{
              width: 160,
              backgroundColor: 'background.paper',
              borderRadius: 50,
              boxShadow: 3
            }}
          >
            <BaseReferrer {...data} />
          </Box>
        )}
      </>
    </BaseNode>
  )
}
