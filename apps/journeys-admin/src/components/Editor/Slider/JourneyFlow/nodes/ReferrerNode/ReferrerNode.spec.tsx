import Box from '@mui/material/Box'
import { render } from '@testing-library/react'
import { Background, type Node, ReactFlow } from '@xyflow/react'

import type { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'

import { ReferrerNode } from '.'

describe('ReferrerNode', () => {
  it('should render default', () => {
    const data = {
      __typename: 'PlausibleStatsResponse',
      property: 'Direct / None',
      visitors: 10
    } as JourneyReferrer

    const nodeProps: Node = {
      id: 'referrer',
      type: 'Referrer',
      data: data as unknown as Record<string, unknown>,
      position: { x: 0, y: 0 },
      dragging: false,
      selected: false,
      zIndex: 1,
      selectable: true,
      connectable: true,
      dragHandle: '',
      hidden: false
    }

    render(
      <Box sx={{ height: 400, width: 600 }}>
        <ReactFlow
          nodes={[nodeProps]}
          edges={[]}
          onConnectStart={() => undefined}
          onConnectEnd={() => undefined}
          fitView
          proOptions={{ hideAttribution: true }}
          nodeTypes={{
            Referrer: ReferrerNode
          }}
        >
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </Box>
    )
  })

  it('should render other sources', () => {
    const data = {
      property: 'other sources',
      referrers: [
        {
          __typename: 'PlausibleStatsResponse',
          property: 'Other',
          visitors: 5
        }
      ] as JourneyReferrer[]
    }

    const nodeProps: Node = {
      id: 'referrer',
      type: 'Referrer',
      data: data as unknown as Record<string, unknown>,
      position: { x: 0, y: 0 },
      dragging: false,
      selected: false,
      zIndex: 1,
      selectable: true,
      connectable: true,
      dragHandle: '',
      hidden: false
    }

    render(
      <Box sx={{ height: 400, width: 600 }}>
        <ReactFlow
          nodes={[nodeProps]}
          edges={[]}
          onConnectStart={() => undefined}
          onConnectEnd={() => undefined}
          fitView
          proOptions={{ hideAttribution: true }}
          nodeTypes={{
            Referrer: ReferrerNode
          }}
        >
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </Box>
    )
  })
})
